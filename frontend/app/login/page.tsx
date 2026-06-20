"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid username or password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-[#FFCC00] font-bold text-lg tracking-widest uppercase">Bejaa Pet</div>
          <div className="text-gray-500 text-sm mt-1">Management System</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#FFCC00]/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#FFCC00]/50"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFCC00] text-black font-semibold text-sm py-2.5 rounded hover:bg-[#e6b800] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
