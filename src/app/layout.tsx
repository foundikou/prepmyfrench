import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepMyFrench",
  description: "Prepare for the TCF Canada with practice exams and expert feedback.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="logo">
            Prep<span>MyFrench</span>
          </Link>
          <nav className="nav-links">
            {session ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/register" className="btn">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
