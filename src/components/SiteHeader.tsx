import Link from "next/link";
import Logo from "@/components/Logo";

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
                  className="inline-flex min-h-11 items-center text-base font-semibold text-rail-fg no-underline hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
