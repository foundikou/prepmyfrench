import Link from "next/link";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Aller au contenu
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="logo">
            Prep<span>MyFrench</span>
          </Link>
          <nav className="nav-links" aria-label="Navigation principale">
            {session ? (
              <>
                <Link href="/dashboard">Tableau de bord</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login">Se connecter</Link>
                <Link href="/register" className="btn">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="contenu" className="mx-auto w-full max-w-6xl px-5 pb-16">
        {children}
      </main>
    </>
  );
}