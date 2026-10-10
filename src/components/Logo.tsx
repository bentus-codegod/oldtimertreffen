import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Wortmarke mit Mini-Kennzeichen: "HH · OS 74 H" – das H am Ende ist das
 * H-Kennzeichen für Oldtimer, OS steht für Oldtimer Stammtisch.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} – Startseite`}
      className={`group inline-flex items-center gap-3 no-underline ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-9 shrink-0 overflow-hidden rounded-[5px] border-2 border-[var(--plate-fg)] bg-[var(--plate-bg)] text-[var(--plate-fg)] shadow-sm"
      >
        <span className="flex w-4 items-end justify-center bg-[var(--plate-eu)] pb-0.5 text-[7px] font-bold leading-none text-white">
          D
        </span>
        <span className="flex items-center px-2 font-mono text-[15px] font-bold tracking-wider">
          HH·OS&nbsp;74&nbsp;H
        </span>
      </span>
      <span className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-rail-fg sm:text-xl">
        {SITE.name}
      </span>
    </Link>
  );
}
