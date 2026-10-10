-- Oldtimer Stammtisch — Schema-Vorbereitung für die geplante KI-Suche
-- ("Welche Werkstatt hat dieses Problem schonmal behandelt?").
--
-- Diese Migration legt nur die Tabelle für Reparaturfälle an — noch OHNE
-- Embedding-Spalte/pgvector. Die Vektorsuche braucht zuerst die Entscheidung
-- für ein Embedding-Modell (z. B. OpenAI text-embedding-3-small = 1536
-- Dimensionen, oder Voyage AI = andere Dimension) — das legt die Spaltengröße
-- fest und kommt als eigene Folge-Migration (0003), sobald die KI-Phase
-- beginnt. Bis dahin ist `problem_beschreibung` einfach durchsuchbarer Text.

create table if not exists public.reparaturfaelle (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  fahrzeug_marke text not null default '',
  fahrzeug_modell text not null default '',
  baujahr int,
  problem_beschreibung text not null,
  diagnose text not null default '',
  loesung text not null default '',
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('verified', 'pending'))
);

comment on table public.reparaturfaelle is 'Reparaturfälle pro Werkstatt — Grundlage für die geplante KI-Suche ("welche Werkstatt kennt dieses Problem?"). status=verified = gegengecheckt, status=pending = unverifiziert eingereicht, analog zu workshops.status.';
comment on column public.reparaturfaelle.problem_beschreibung is 'Freitext-Symptombeschreibung. Wird später die Quelle für das Embedding sein.';

create index if not exists reparaturfaelle_workshop_idx on public.reparaturfaelle (workshop_id);
create index if not exists reparaturfaelle_status_idx on public.reparaturfaelle (status);
create index if not exists reparaturfaelle_tags_idx on public.reparaturfaelle using gin (tags);

alter table public.reparaturfaelle enable row level security;

-- Gleiches Muster wie bei workshops: öffentlich lesbar (inkl. ungeprüfter
-- Fälle, als "ungeprüft" gekennzeichnet), öffentliches Einreichen nur als
-- 'pending'. Vor dem Live-Gang der KI-Suche nochmal bewusst prüfen, ob
-- Reparatur-/Diagnosehinweise wirklich auch ungeprüft öffentlich lesbar sein
-- sollen (anders als bloße Kontaktdaten potenziell sicherheitsrelevant, wenn
-- jemand einer falschen Diagnose vertraut) — ggf. read auf status='verified'
-- einschränken.
drop policy if exists "reparaturfaelle_public_read" on public.reparaturfaelle;
create policy "reparaturfaelle_public_read"
  on public.reparaturfaelle
  for select
  to anon, authenticated
  using (true);

drop policy if exists "reparaturfaelle_public_insert_pending" on public.reparaturfaelle;
create policy "reparaturfaelle_public_insert_pending"
  on public.reparaturfaelle
  for insert
  to anon, authenticated
  with check (status = 'pending');
