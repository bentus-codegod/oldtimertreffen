-- Oldtimer Stammtisch — Accounts (Supabase Auth), Phase 1
--
-- Voraussetzung: In Supabase unter Authentication den E-Mail-Provider mit
-- "Confirm email" aktiviert und die Site-URL gesetzt (siehe Roadmap-Doc).
--
-- Dieses Skript:
--  1. legt pro Nutzer ein Profil an (automatisch bei Registrierung),
--  2. koppelt Erfahrungsberichte an das Nutzerkonto (user_id),
--  3. stellt das Einreichen von Berichten auf "nur eingeloggt" um und
--     veröffentlicht sie automatisch (status='verified'),
--  4. legt eine Meldungen-Tabelle für den "Melden"-Button an (Notice-and-Takedown).
--
-- Im Supabase SQL Editor ausführen, NACH 0001–0003.

-- ----------------------------------------------------------------- Profile --

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  anzeigename text not null default '',
  ist_werkstatt boolean not null default false,
  constraint profiles_anzeigename_len check (char_length(anzeigename) <= 40)
);

comment on table public.profiles is 'Öffentliches Profil pro Konto. ist_werkstatt wird später für "Werkstatt beanspruchen" (Phase 2) genutzt.';

alter table public.profiles enable row level security;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profil automatisch bei Registrierung anlegen.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, anzeigename)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'anzeigename', ''), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------- Berichte an Konto koppeln ---

alter table public.reparaturfaelle
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists reparaturfaelle_user_idx on public.reparaturfaelle (user_id);

-- Einreichen NEU: nur eingeloggte Nutzer, und nur im eigenen Namen.
-- (Ersetzt das alte anonyme "insert as pending" aus 0002.)
drop policy if exists "reparaturfaelle_public_insert_pending" on public.reparaturfaelle;
drop policy if exists "reparaturfaelle_auth_insert" on public.reparaturfaelle;
create policy "reparaturfaelle_auth_insert"
  on public.reparaturfaelle for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Eigenen Bericht darf man später löschen/ändern (Phase 2: bearbeiten).
drop policy if exists "reparaturfaelle_update_own" on public.reparaturfaelle;
create policy "reparaturfaelle_update_own"
  on public.reparaturfaelle for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reparaturfaelle_delete_own" on public.reparaturfaelle;
create policy "reparaturfaelle_delete_own"
  on public.reparaturfaelle for delete
  to authenticated
  using (auth.uid() = user_id);

-- --------------------------------------------------- Meldungen (Melden) ----

create table if not exists public.meldungen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  review_id uuid not null references public.reparaturfaelle(id) on delete cascade,
  melder_id uuid references auth.users(id) on delete set null,
  grund text not null default '',
  constraint meldungen_grund_len check (char_length(grund) <= 500)
);

comment on table public.meldungen is 'Gemeldete Bewertungen (Notice-and-Takedown). Nur über Service-Role/Dashboard lesbar; Löschung der Bewertung erfolgt manuell nach Prüfung.';

alter table public.meldungen enable row level security;

drop policy if exists "meldungen_insert" on public.meldungen;
create policy "meldungen_insert"
  on public.meldungen for insert
  to authenticated
  with check (auth.uid() = melder_id);
-- Kein öffentliches Lesen: Meldungen sieht nur Lisa über das Dashboard (Service-Role).
