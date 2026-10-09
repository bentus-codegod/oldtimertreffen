-- Werkstattregister Hamburg — Seed-Daten
-- Die 17 recherchierten Werkstätten aus der ersten Recherche-Runde.
-- Nach der Migration (0001_init.sql) einmal im Supabase SQL-Editor ausführen.
--
-- Hinweis zur Datenqualität (vor Live-Gang kurz gegenchecken):
--   - CARCLASSICA CMP: in den Quellen gab es zwei widersprüchliche Adressangaben.
--   - Fernandes Oldtimertechnik: zwei widersprüchliche Telefonnummern gefunden.
--   - Hallier Classic Cars, Eberhard Thiesen, M&M Manufaktur, Zukowsky Classic Cars:
--     nur als Händler bestätigt, Werkstatt-/Reparaturservice nicht verifiziert.

insert into public.workshops (name, strasse, plz, ort, telefon, website, marken, gewerke, status, quelle) values
('Mirbach & Seemann GmbH', 'Osterbrooksweg 62', '22869', 'Schenefeld', '040 55503839', 'mirbach-seemann.de', '{"Mercedes-Benz"}', '{"Karosserie","Lackierung","Motor","Sattlerei / Interieur","Restaurierung komplett"}', 'verified', 'recherche'),
('CarMania GmbH', 'Maimoorweg 60a', '22179', 'Hamburg', '', '', '{"US-Cars","Mercedes-Benz","Jaguar / Britisch"}', '{"Restaurierung komplett","Ersatzteile / Zubehör","Karosserie"}', 'verified', 'recherche'),
('Route 66 Borrmann Motors KG', 'Kieler Straße 271', '22525', 'Hamburg', '040 541095', 'route66-hh.de', '{"US-Cars"}', '{"Karosserie","Elektrik","Sattlerei / Interieur","Motor"}', 'verified', 'recherche'),
('Fernandes Oldtimertechnik GmbH', 'Wilhelm-Stein-Weg 20', '22339', 'Hamburg (Hummelsbüttel)', '040 52731497', '', '{"Alfa Romeo / Italienisch","Jaguar / Britisch"}', '{"Restaurierung komplett","Ersatzteile / Zubehör"}', 'verified', 'recherche'),
('Arnst Auto-Technik GmbH', 'Schwarzerweg 9', '20099', 'Hamburg', '040 498894', '', '{"Alfa Romeo / Italienisch"}', '{"Elektrik"}', 'verified', 'recherche'),
('9elf-Hamburg GmbH & Co. KG', 'Nedderfeld 23', '22529', 'Hamburg', '040 87939291', '9elf-hamburg.de', '{"Porsche"}', '{"Motor","Restaurierung komplett","Handel"}', 'verified', 'recherche'),
('VOSSWERK GmbH – Oldtimer & Automobilwerkstatt', 'Pinneberger Chaussee 7', '25436', 'Moorrege', '04122 810315', 'vosswerk.de', '{"Alle Marken"}', '{"Karosserie","Motor","Sattlerei / Interieur","Lackierung","Restaurierung komplett"}', 'verified', 'recherche'),
('Auto-Schultz GmbH (CARSPIRIT)', 'Niedergeorgswerder Deich 97', '21109', 'Hamburg', '040 3117150', 'auto-schultz.de', '{"Toyota","Alle Marken"}', '{"Karosserie"}', 'verified', 'recherche'),
('Armin Leppek Auto-Service', 'Harderweg 16', '22549', 'Hamburg', '040 22757573', 'armin-leppek.de', '{"Porsche"}', '{"Motor"}', 'verified', 'recherche'),
('Mikes Garage', 'Havighorster Weg 14', '21031', 'Hamburg', '', '', '{"Alle Marken","Mercedes-Benz"}', '{"Handel"}', 'verified', 'recherche'),
('Hallier Classic Cars GmbH', 'Gut Stellmoor 2', '22926', 'Ahrensburg', '', '', '{"Alle Marken","Jaguar / Britisch","Porsche"}', '{"Handel"}', 'verified', 'recherche'),
('CARCLASSICA CMP GmbH', 'Mühlenkamp 31', '22303', 'Hamburg', '04191 9562090', '', '{"Alle Marken"}', '{"Restaurierung komplett","Handel"}', 'verified', 'recherche'),
('WEWO Classic Oldtimer Service GmbH', 'Kroonstücken 7', '22045', 'Hamburg (Tonndorf)', '040 38667177', 'wewo-classic.de', '{"Alle Marken"}', '{"Karosserie","Motor","Sattlerei / Interieur","Lackierung","Restaurierung komplett"}', 'verified', 'recherche'),
('Classic Manufactory Instruments', 'Lemsahler Weg 23', '22851', 'Norderstedt', '040 5407636', 'cm-instruments.de', '{"Alle Marken"}', '{"Ersatzteile / Zubehör"}', 'verified', 'recherche'),
('Eberhard Thiesen GmbH & Co. KG', 'Tarpen 40, Halle 12', '22419', 'Hamburg (Langenhorn)', '040 99998 6800', 'eberhard-thiesen.de', '{"Porsche"}', '{"Ersatzteile / Zubehör","Handel"}', 'verified', 'recherche'),
('M&M Manufaktur und Motor – Classic Garage', 'Am Hehsel 40', '22339', 'Hamburg', '040 46657036', '', '{"Alle Marken"}', '{"Restaurierung komplett"}', 'verified', 'recherche'),
('Zukowsky Classic Cars GmbH', 'Süntelstraße 20a', '22457', 'Hamburg (Schnelsen)', '040 387605', '', '{"Alle Marken"}', '{"Handel"}', 'verified', 'recherche')
on conflict do nothing;
