-- Oldtimer Stammtisch — Erfahrungsberichte + Prüfung vor Veröffentlichung
--
-- 1. Erweitert `reparaturfaelle` (Migration 0002) um die Felder eines
--    Erfahrungsberichts: Bewertung, Schilderung, Kosten, Empfehlung, Name.
--    Ein Erfahrungsbericht IST ein Reparaturfall – dieselbe Tabelle dient später
--    als Wissensbasis für die KI-Suche ("welche Werkstatt kennt dieses Problem?").
-- 2. Stellt die Lese-Policies um: öffentlich sichtbar ist NUR noch, was geprüft
--    ist (status = 'verified'). Neue Einreichungen bleiben unsichtbar, bis sie
--    freigegeben werden (im Prüfbereich /admin oder im Supabase Table Editor).
-- 3. Harte Längenbegrenzungen in der Datenbank – zusätzlich zur Validierung in
--    der App, falls jemand die API direkt anspricht.
--
-- Im Supabase SQL Editor ausführen, NACH 0001 und 0002.

-- ---------------------------------------------------------------- Berichte --

alter table public.reparaturfaelle
  add column if not exists autor_name text not null default '',
  add column if not exists erfahrung text not null default '',
  add column if not exists bewertung smallint,
  add column if not exists kosten_einordnung text not null default '',
  add column if not exists wuerde_empfehlen boolean not null default true;

alter table public.reparaturfaelle drop constraint if exists reparaturfaelle_bewertung_range;
alter table public.reparaturfaelle
  add constraint reparaturfaelle_bewertung_range
  check (bewertung is null or bewertung between 1 and 5);

alter table public.reparaturfaelle drop constraint if exists reparaturfaelle_kosten_values;
alter table public.reparaturfaelle
  add constraint reparaturfaelle_kosten_values
  check (kosten_einordnung in ('', 'guenstig', 'fair', 'teuer'));

alter table public.reparaturfaelle drop constraint if exists reparaturfaelle_lengths;
alter table public.reparaturfaelle
  add constraint reparaturfaelle_lengths
  check (
    char_length(autor_name) <= 40
    and char_length(fahrzeug_marke) <= 40
    and char_length(fahrzeug_modell) <= 60
    and char_length(problem_beschreibung) <= 1500
    and char_length(loesung) <= 1500
    and char_length(erfahrung) <= 1500
    and (baujahr is null or baujahr between 1900 and 2100)
  );

comment on column public.reparaturfaelle.erfahrung is 'Freitext: Wie war die Zusammenarbeit/der Ablauf insgesamt?';
comment on column public.reparaturfaelle.loesung is 'Freitext: Was hat die Werkstatt konkret gemacht?';

-- ------------------------------------------------------ Längen Werkstätten --

alter table public.workshops drop constraint if exists workshops_lengths;
alter table public.workshops
  add constraint workshops_lengths
  check (
    char_length(name) between 2 and 120
    and char_length(strasse) <= 120
    and char_length(plz) <= 10
    and char_length(ort) <= 80
    and char_length(telefon) <= 30
    and char_length(website) <= 120
    and char_length(hinweis) <= 500
  );

-- ----------------------------------------------- Lesen nur wenn geprüft ----

drop policy if exists "workshops_public_read" on public.workshops;
create policy "workshops_public_read"
  on public.workshops
  for select
  to anon, authenticated
  using (status = 'verified');

drop policy if exists "reparaturfaelle_public_read" on public.reparaturfaelle;
create policy "reparaturfaelle_public_read"
  on public.reparaturfaelle
  for select
  to anon, authenticated
  using (status = 'verified');

-- Einreichen bleibt wie bisher: jeder darf, aber nur als 'pending'
-- (Policies `*_public_insert_pending` aus 0001/0002 bleiben unverändert).
-- Ändern/Löschen darf nur, wer den Service-Role-Key hat (der Prüfbereich) bzw.
-- das Supabase-Dashboard – es gibt bewusst keine öffentliche Update/Delete-Policy.

-- ------------------------------ Kontaktdaten mit Konflikten kennzeichnen ----

update public.workshops
set hinweis = 'Kontaktdaten werden gerade geprüft – bitte vor dem Besuch kurz telefonisch bestätigen.'
where name in ('CARCLASSICA CMP GmbH', 'Fernandes Oldtimertechnik GmbH')
  and hinweis = '';

update public.workshops
set hinweis = 'Nur als Händler bestätigt, Werkstattservice nicht verifiziert.'
where name in ('Hallier Classic Cars GmbH', 'Eberhard Thiesen GmbH & Co. KG', 'Zukowsky Classic Cars GmbH')
  and hinweis = '';
