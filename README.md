# Blechliebe — Werkstattfinder Hamburg

Werkstattsuche für Oldtimer in Hamburg: Filterbar nach Marke und Gewerk, mit
Selbsteintrag-Formular für neue Werkstätten. Erster Baustein der geplanten
Oldtimer-Plattform (siehe weitere Features: Zubehörmarkt, Werbung,
Inserats-Bündelung, Gutachter-Buchung, Ersatzteile/3D-Druck).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, Tailwind CSS v4)
- [Supabase](https://supabase.com/) (Postgres-Datenbank, öffentlicher Lese-/beschränkter Schreibzugriff über Row Level Security)
- [Vitest](https://vitest.dev/) für Unit-Tests
- Deployment: [Vercel](https://vercel.com/)

Die App funktioniert auch **ohne** Supabase-Anbindung (z. B. lokal beim ersten
Ausprobieren): Sie zeigt dann automatisch die 17 recherchierten Werkstätten aus
`src/data/seed-workshops.ts` an und markiert sich selbst als Demo-Modus. Das
Selbsteintrag-Formular funktioniert erst, sobald Supabase eingerichtet ist.

## 1. Lokal starten

```bash
npm install
npm run dev
```

Öffnet auf http://localhost:3000 — läuft sofort im Demo-Modus mit den
statischen Seed-Daten.

```bash
npm test        # Unit-Tests (Filterlogik)
npm run build   # Produktions-Build
npm run lint    # ESLint
```

## 2. Supabase-Projekt einrichten (damit jeder Einträge vorschlagen kann)

1. Auf [supabase.com](https://supabase.com) kostenlos einen Account anlegen
   und ein neues Projekt erstellen (Name z. B. `blechliebe`).
2. Im Projekt unter **SQL Editor** → **New query** nacheinander den Inhalt von
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   und [`supabase/migrations/0002_reparaturfaelle.sql`](supabase/migrations/0002_reparaturfaelle.sql)
   einfügen und ausführen. Das legt `workshops` und `reparaturfaelle` inkl.
   Row-Level-Security an (jeder darf lesen, jeder darf neue Einträge nur als
   `pending` einreichen — niemand kann sich selbst verifizieren).
   `reparaturfaelle` ist reine Schema-Vorbereitung für die geplante
   KI-Suche (siehe unten) — die aktuelle App liest/schreibt diese Tabelle
   noch nicht.
3. Danach den Inhalt von [`supabase/seed.sql`](supabase/seed.sql) ausführen,
   um die 17 recherchierten Werkstätten einzuspielen (`status = verified`).
4. Unter **Project Settings → API** die **Project URL** und den
   **`anon` public key** kopieren.
5. Lokal eine `.env.local` Datei anlegen (siehe `.env.example`):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

   Der `anon`-Key ist bewusst für den Browser gedacht (daher
   `NEXT_PUBLIC_`-Präfix) — der Schutz läuft über die RLS-Policy, nicht über
   Geheimhaltung dieses Keys.

6. Neu starten (`npm run dev`) — die Seite lädt jetzt live aus Supabase statt
   aus den Seed-Daten.

### Neue Einträge freischalten

Einreichungen aus dem Formular landen mit `status = 'pending'` und werden auf
der Seite als „Neu · ungeprüft" angezeigt. Um einen Eintrag als geprüft zu
markieren: im Supabase-Dashboard unter **Table Editor → workshops** die Zeile
öffnen und `status` auf `verified` setzen. Es gibt bewusst keinen
Schreibzugriff dafür über die App selbst (nur du als Projekt-Owner kannst das
im Dashboard).

## 3. Deployment auf Vercel

1. Repo auf GitHub pushen (siehe unten).
2. Auf [vercel.com](https://vercel.com) mit GitHub einloggen → **Add New
   Project** → dieses Repo auswählen.
3. Unter **Environment Variables** die beiden Werte aus Schritt 2.5
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) eintragen.
4. Deploy. Jeder Push auf den `main`-Branch löst danach automatisch ein neues
   Deployment aus.

## 4. GitHub

```bash
git remote add origin <URL deines leeren GitHub-Repos>
git branch -M main
git push -u origin main
```

## Datenqualität der Seed-Daten

Vor dem Live-Gang kurz gegenchecken:

- **CARCLASSICA CMP GmbH**: In den Quellen gab es zwei widersprüchliche
  Adressangaben.
- **Fernandes Oldtimertechnik GmbH**: Zwei widersprüchliche Telefonnummern
  gefunden.
- **Hallier Classic Cars, Eberhard Thiesen, Zukowsky Classic Cars**: Nur als
  Händler bestätigt, Werkstatt-/Reparaturservice nicht verifiziert (im
  `hinweis`-Feld entsprechend markiert).

## Geplant: KI-Suche "welche Werkstatt kennt dieses Problem?"

Phase 2 (noch nicht gebaut): Nutzer beschreibt ein Problem in natürlicher
Sprache, eine KI gleicht es per Embedding-Ähnlichkeitssuche gegen
gespeicherte Reparaturfälle ab und schlägt eine Werkstatt vor, die das
Problem schonmal behandelt hat. Die Tabelle `reparaturfaelle`
([`supabase/migrations/0002_reparaturfaelle.sql`](supabase/migrations/0002_reparaturfaelle.sql))
ist dafür schon angelegt, bewusst noch ohne Embedding-Spalte/`pgvector` —
die kommt erst, wenn das Embedding-Modell feststeht (eigene Migration 0003).

Wichtiger Kontext aus der Recherche zum bestehenden Markt: etablierte
Werkstattsoftware (Werbas/KSR, easyWerkstatt, Catama, Loco-Soft u. a.,
international Shopmonkey/Tekmetric/AutoLeap) deckt Fahrzeug-/Kundenakte mit
Reparaturhistorie längst ab — Werbas hatte sogar ein eigenes
Oldtimer-Modul. Diese Daten liegen aber isoliert in der jeweiligen
Werkstatt-Software und werden nicht werkstattübergreifend durchsucht. Der
Mehrwert dieser App liegt also nicht im Ersetzen der internen
Dokumentation, sondern in einer werkstattübergreifenden Wissensebene
darüber — das spricht dafür, Werkstätten den Fall möglichst reibungslos
hier eintragen zu lassen (oder später per Import aus ihrer bestehenden
Software), statt eine Konkurrenz zu Werbas & Co. zu bauen.

## Projektstruktur

```
src/
  app/                 Next.js App Router (layout, page, globals.css)
  components/          WorkshopExplorer, WorkshopCard, SelfEntryForm
  lib/                 types, Supabase-Client, Filterlogik (+ Tests), Datenzugriff
  data/                Statische Seed-/Fallback-Werkstätten
supabase/
  migrations/0001_init.sql   Schema + Row Level Security
  seed.sql                   Die 17 recherchierten Werkstätten
```
