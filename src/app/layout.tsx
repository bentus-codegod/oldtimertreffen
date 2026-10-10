import type { Metadata } from "next";
import "./globals.css";

// Bewusst keine next/font/google-Fonts: next/font lädt die Font-Dateien beim
// Build herunter, und dieses Projekt soll auch in Netzwerk-eingeschränkten
// CI-/Sandbox-Umgebungen zuverlässig bauen. Die Typografie kommt stattdessen
// aus sorgfältig gewählten System-Font-Stacks (siehe globals.css).

export const metadata: Metadata = {
  title: "Blechliebe – Oldtimer-Werkstätten in Hamburg",
  description:
    "Werkstattsuche für Oldtimer in Hamburg mit Marken-/Gewerk-Filter und Selbsteintrag-Formular für neue Werkstätten.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
