import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bejaa Pet Management",
  description: "Premium Pet Hotel & Clinic Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
