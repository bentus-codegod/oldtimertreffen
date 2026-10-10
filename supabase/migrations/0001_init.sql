-- Oldtimer Stammtisch — initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  strasse text not null,
  plz text not null,
  ort text not null default 'Hamburg',
  telefon text not null default '',
  website text not null default '',
  marken text[] not null default '{}',
  gewerke text[] not null default '{}',
  hinweis text not null default '',
  status text not null default 'pending' check (status in ('verified', 'pending')),
  quelle text not null default 'selbsteintrag'
);

comment on table public.workshops is 'Werkstätten im Register. status=verified = von Lisa recherchiert/geprüft, status=pending = über das Selbsteintrag-Formular eingereicht.';

create index if not exists workshops_status_idx on public.workshops (status);
create index if not exists workshops_ort_idx on public.workshops (ort);

alter table public.workshops enable row level security;

-- Jeder darf alle Einträge lesen (verified + pending), damit neue Einträge sofort sichtbar sind.
drop policy if exists "workshops_public_read" on public.workshops;
create policy "workshops_public_read"
  on public.workshops
  for select
  to anon, authenticated
  using (true);

-- Jeder darf neue Werkstätten vorschlagen, aber nur als 'pending' — niemand kann sich selbst verifizieren.
drop policy if exists "workshops_public_insert_pending" on public.workshops;
create policy "workshops_public_insert_pending"
  on public.workshops
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Kein öffentliches Update/Delete: Verifizieren macht Lisa manuell im Supabase Table Editor
-- (status-Feld von 'pending' auf 'verified' setzen) — bewusst kein Public-Write-Pfad dafür.
