import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { ButtonLink } from "@/components/ui/Button";

export function Navbar({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="logo">
          Prep<span>MyFrench</span>
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          {loggedIn ? (
            <>
              <Link href="/dashboard">Tableau de bord</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">Se connecter</Link>
              <ButtonLink href="/register">S&apos;inscrire</ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}