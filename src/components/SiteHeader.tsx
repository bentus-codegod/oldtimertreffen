import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { signOutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/werkstaetten", label: "Werkstätten" },
  { href: "/eintragen", label: "Werkstatt eintragen" },
] as const;

export default function SiteHeader() {
  return (
    <header className="border-b-4 border-accent bg-rail text-rail-fg">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
        <Logo />
        <nav aria-label="Hauptnavigation">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-base font-semibold text-rail-fg no-underline transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <Suspense fallback={null}>
              <AuthNav />
            </Suspense>
          </ul>
        </nav>
      </div>
    </header>
  );
}

async function AuthNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <li>
          <Link
            href="/anmelden"
            className="inline-flex min-h-11 items-center text-base font-semibold text-rail-fg no-underline transition-colors hover:text-accent"
          >
            Anmelden
          </Link>
        </li>
        <li>
          <Link href="/registrieren" className="btn-rail min-h-10 px-4 py-1.5 text-base">
            Registrieren
          </Link>
        </li>
      </>
    );
  }

  return (
    <li className="flex items-center gap-3">
      <span className="hidden max-w-[12rem] truncate text-sm text-rail-muted sm:inline" title={user.email}>
        {user.email}
      </span>
      <form action={signOutAction}>
        <button type="submit" className="btn-rail min-h-10 px-4 py-1.5 text-base">
          Abmelden
        </button>
      </form>
    </li>
  );
}
