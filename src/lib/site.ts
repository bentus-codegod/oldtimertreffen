/**
 * Zentrale Marken-/Seiten-Konfiguration. Wer die Marke später umbenennt
 * (oder eine eigene Domain setzt), ändert nur diese Datei bzw. die Env-Variablen.
 */
export const SITE = {
  name: "Oldtimer Stammtisch",
  /** Kurzform für enge Stellen (Header auf dem Handy). */
  shortName: "Stammtisch",
  tagline: "Wo schraubt der Stammtisch?",
  description:
    "Oldtimer-Werkstätten rund um Hamburg – mit ehrlichen Erfahrungsberichten von Leuten, die ihren Klassiker wirklich dort hingebracht haben.",
  region: "Hamburg",
  /** Öffentliche Basis-URL (für Sitemap, Open Graph, kanonische Links). */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Kontakt-E-Mail für Impressum/Datenschutz – per Env setzen. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  /** Verantwortliche Person/Firma für das Impressum – per Env setzen. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "",
  /** Anschrift, Zeilen getrennt durch "|" (z. B. "Musterstraße 1|20095 Hamburg"). */
  legalAddress: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? "",
} as const;

/** Sind alle Pflichtangaben für das Impressum hinterlegt? */
export function legalDetailsComplete(): boolean {
  return Boolean(SITE.legalName && SITE.legalAddress && SITE.contactEmail);
}
