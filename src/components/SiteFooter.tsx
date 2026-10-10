import Link from "next/link";
import { SITE } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-rail text-rail-fg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="font-display text-xl font-bold uppercase tracking-wide">{SITE.name}</p>
          <p className="mt-2 text-base text-rail-muted">
            Von Oldtimer-Leuten für Oldtimer-Leute. Jeder Eintrag und jeder Erfahrungsbericht wird
            vor der Veröffentlichung von Hand geprüft.
          </p>
        </div>
        <nav aria-label="Rechtliches und Service">
          <ul className="flex flex-col gap-1 text-base">
            <li>
              <Link href="/werkstaetten" className="inline-flex min-h-10 items-center text-rail-fg hover:text-accent">
                Alle Werkstätten
              </Link>
            </li>
            <li>
              <Link href="/eintragen" className="inline-flex min-h-10 items-center text-rail-fg hover:text-accent">
                Werkstatt eintragen
              </Link>
            </li>
            <li>
              <Link href="/impressum" className="inline-flex min-h-10 items-center text-rail-fg hover:text-accent">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="inline-flex min-h-10 items-center text-rail-fg hover:text-accent">
                Datenschutz
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
