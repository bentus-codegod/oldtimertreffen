# Oldtimer Stammtisch

Werkstattfinder für Oldtimer in Hamburg und Umland – mit Erfahrungsberichten von
Besitzern, Selbsteintrag für Werkstätten und **Prüfung vor jeder Veröffentlichung**.
Erster Baustein einer größeren Oldtimer-Plattform (Treffen, Rallyes, Stellplätze,
Marktplatz – siehe „Bald am Stammtisch“ auf der Startseite).

Der Markenname steht zentral in [`src/lib/site.ts`](src/lib/site.ts) – wer ihn ändert,
ändert die ganze Seite (Header, Titel, Texte, Logo).

## Was die Seite kann

- **Startseite** mit Suche, Marken-Schnellwahl, neuesten Berichten, Ausblick
- **Verzeichnis** `/werkstaetten`: alle Werkstätten; Filter nach Marke, Leistung, Gebiet
  (Hamburg/Umland); Freitext durchsucht auch die Erfahrungsberichte („Vergaser W123“);
  Deep-Links wie `/werkstaetten?marke=Porsche`
- **Werkstatt-Detailseite** `/werkstatt/<name-ort>`: Kontakt-Buttons (Anrufen, Route,
  Website), Marken, Leistungen, Bewertungsschnitt, Erfahrungsberichte, Berichtsformular,
  Schema.org-Daten für Google
- **Werkstatt eintragen** `/eintragen`: Formular mit serverseitiger Validierung
- **Erfahrungsbericht**: Fahrzeug (Marke/Modell/Baujahr), Problem, was gemacht wurde,
  Gesamteindruck, Sterne, Kosten, Empfehlung
- **Prüfbereich** `/admin`: neue Werkstätten und Berichte freigeben oder ablehnen
- Impressum, Datenschutz, Sitemap, robots.txt, 404-Seite, Dunkelmodus, große Schrift

## So funktioniert die Prüfung

Alles, was Besucher einreichen, landet mit `status = 'pending'` in der Datenbank. Die
Row-Level-Security-Policies erzwingen das (niemand kann sich selbst freischalten) und
lassen die Öffentlichkeit **nur `verified`-Zeilen lesen**. Freigeben oder Ablehnen geht
im Prüfbereich `/admin` (Passwort) – oder direkt im Supabase Table Editor
(`status` auf `verified` setzen).

Spam-Schutz: unsichtbares Honeypot-Feld, serverseitige Validierung mit Längenlimits,
Pflicht-Bestätigung, harte Längen-Checks zusätzlich in der Datenbank. Ein Rate-Limit pro
IP gibt es noch nicht (siehe „Nächste Schritte“).

## Stack

[Next.js 16](https://nextjs.org/) (App Router, Cache Components, TypeScript,
Tailwind CSS v4) · [Supabase](https://supabase.com/) (Postgres + Row Level Security) ·
[Vitest](https://vitest.dev/) · Deployment auf [Vercel](https://vercel.com/).
Es werden bewusst keine externen Schriften geladen (System-Fonts) – der Build läuft
auch in Netzwerk-eingeschränkten Umgebungen.

Ohne Supabase-Anbindung läuft die Seite im **Vorschau-Modus** mit den recherchierten
Werkstätten aus `src/data/seed-workshops.ts`; Formulare melden dann freundlich, dass
noch keine Datenbank verbunden ist.

## 1. Lokal starten

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Unit-Tests (Filter, Validierung, Slugs, Admin-Session …)
npm run lint
npm run build
```

## 2. Supabase einrichten

1. Auf [supabase.com](https://supabase.com) ein Projekt anlegen – **Region „Frankfurt
   (eu-central-1)“ wählen** (Datenschutz).
2. Im **SQL Editor** nacheinander ausführen:
   `supabase/migrations/0001_init.sql` → `0002_reparaturfaelle.sql` →
   `0003_erfahrungsberichte.sql` → dann `supabase/seed.sql` und `supabase/seed-weitere.sql` (alle recherchierten Werkstätten).
3. Unter **Project Settings → API** kopieren: *Project URL*, *anon public key* und
   *service_role key* (letzterer ist geheim!).
4. `.env.local` anlegen (Vorlage: `.env.example`) und alle Werte eintragen.

> Wichtig: `0003` stellt die Lese-Policies um – danach sieht die Öffentlichkeit nur noch
> geprüfte Einträge. Es muss also **nach** dem Seed laufen oder die Seed-Zeilen haben
> bereits `status = 'verified'` (haben sie).

## 3. Deployment auf Vercel

1. Repo auf GitHub pushen, auf [vercel.com](https://vercel.com) **Add New Project** →
   Repo wählen.
2. Unter **Environment Variables** alle Werte aus `.env.example` eintragen.
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` **nicht** mit
   `NEXT_PUBLIC_` versehen.
3. Deploy. Eigene Domain: Vercel → Settings → Domains; danach `NEXT_PUBLIC_SITE_URL`
   auf die Domain setzen und neu deployen.

## Vor dem Live-Gang

- [ ] Impressum/Datenschutz-Angaben per Env setzen (Seiten warnen sichtbar, solange sie
      fehlen) und die Texte einmal rechtlich prüfen lassen – sie sind eine solide
      Vorlage, aber kein Rechtsrat.
- [ ] Datenqualität der Seed-Daten gegenchecken: *CARCLASSICA CMP* (zwei widersprüchliche
      Adressen) und *Fernandes Oldtimertechnik* (zwei Telefonnummern) sind auf der
      Seite als „Kontaktdaten werden geprüft“ markiert; *Hallier*, *Eberhard Thiesen*,
      *Zukowsky* sind nur als Händler bestätigt (ebenfalls gekennzeichnet).
- [ ] Prüfbereich einmal durchspielen: Werkstatt einreichen → in `/admin` freigeben →
      erscheint in der Liste.

## Vorbereitet, noch nicht aktiv

- **Route zur Werkstatt:** Auf jeder Detailseite und Karte gibt es „Route planen“ – ein Link
  auf Google Maps mit der Werkstatt-Adresse als Ziel (`mapsHref` in
  `src/components/ContactActions.tsx`). Es wird keine Karte eingebettet und kein Google-Skript
  geladen, also auch kein Cookie-Banner nötig.
- **Nur mit Anmeldung:** Geplant ist Supabase Auth (E-Mail-Link) mit einem Schalter
  `NEXT_PUBLIC_LOGIN_REQUIRED`. Bis dahin bleibt die Seite offen; Einreichen und Berichte
  laufen weiter über die Prüfung.

## Nächste Schritte (Ideen)

- Rate-Limit pro IP für die Formulare (z. B. Upstash/Vercel KV) und optional Turnstile
- E-Mail-Benachrichtigung bei neuer Einreichung
- Werkstatt „übernehmen“ (Betreiber pflegen ihr Profil selbst)
- Korrektur-melden-Button pro Werkstatt
- KI-Suche „Welche Werkstatt kennt dieses Problem?“: Die Tabelle `reparaturfaelle` ist
  bereits die Wissensbasis; es fehlen Embeddings (`pgvector`, Migration 0004) und ein
  Modell (Voyage AI für Embeddings, ein günstiges Claude-Modell für die Auswertung)
- Treffen/Ausfahrten, Rallyes, Stellplätze, Marktplatz

## Projektstruktur

```
src/
  app/                 Seiten: Start, werkstaetten, werkstatt/[slug], eintragen,
                       admin, impressum, datenschutz, sitemap, robots
  components/          Karten, Formulare, Verzeichnis (Client), Logo, Header/Footer
  lib/                 Typen, Filter, Validierung, Datenzugriff (gecacht), Slugs,
                       Bewertungen, Admin-Login, Supabase-Clients (+ Tests)
  data/                Seed-/Fallback-Werkstätten
supabase/
  migrations/          0001 Schema+RLS · 0002 Reparaturfälle · 0003 Berichte+Prüfung
  seed.sql, seed-weitere.sql   Die recherchierten Werkstätten
```
