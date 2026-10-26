// Signed session cookie, readable in both the Edge middleware and Node route handlers (Web Crypto only)
export interface Session {
  id: number;
  name: string;
  role: "Boss" | "Staff";
  exp: number;
}

export const SESSION_HOURS = 8;

function toB64url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET ?? "";
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(data: Omit<Session, "exp">): Promise<string> {
  const session: Session = { ...data, exp: Date.now() + SESSION_HOURS * 3600 * 1000 };
  const body = toB64url(new TextEncoder().encode(JSON.stringify(session)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(body));
  return `${body}.${toB64url(new Uint8Array(sig))}`;
}

export async function readSession(value: string | undefined): Promise<Session | null> {
  if (!value || !process.env.AUTH_SECRET) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), new TextEncoder().encode(body));
    if (!ok) return null;
    const session: Session = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}
