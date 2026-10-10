export type ModerationStatus = "verified" | "pending";

export interface Workshop {
  id: string;
  /** URL-Kennung, abgeleitet aus Name + Ort (siehe lib/slug.ts). */
  slug: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  website: string;
  marken: string[];
  gewerke: string[];
  hinweis: string;
  status: ModerationStatus;
}

/** Rohdatensatz ohne Slug (Seed-Daten und Datenbankzeilen). */
export type WorkshopRecord = Omit<Workshop, "slug">;

/** Marken-Gruppen, die beim Eintragen zur Auswahl stehen. */
export const MARKEN = [
  "Mercedes-Benz",
  "Porsche",
  "BMW",
  "VW / Audi",
  "US-Cars",
  "Jaguar / Britisch",
  "Alfa Romeo / Italienisch",
  "Französisch",
  "Toyota",
  "Alle Marken",
] as const;

export const GEWERKE = [
  "Motor",
  "Getriebe / Fahrwerk",
  "Elektrik",
  "Karosserie",
  "Lackierung",
  "Sattlerei / Interieur",
  "Restaurierung komplett",
  "Ersatzteile / Zubehör",
  "Handel",
] as const;

export const REGIONEN = ["Hamburg", "Umland"] as const;
export type Region = (typeof REGIONEN)[number];

export type SortKey = "name" | "bewertung" | "berichte";

export interface WorkshopFilter {
  marke: string;
  gewerk: string;
  suche: string;
  region?: string;
}

export interface NewWorkshopInput {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  website: string;
  marken: string[];
  gewerke: string[];
  hinweis: string;
}

export const KOSTEN = [
  { value: "guenstig", label: "Günstig" },
  { value: "fair", label: "Fair" },
  { value: "teuer", label: "Teuer" },
] as const;
export type Kosten = (typeof KOSTEN)[number]["value"];

/** Erfahrungsbericht = ein Reparaturfall bei einer Werkstatt (Tabelle `reparaturfaelle`). */
export interface Review {
  id: string;
  created_at: string;
  workshop_id: string;
  autor_name: string;
  fahrzeug_marke: string;
  fahrzeug_modell: string;
  baujahr: number | null;
  problem_beschreibung: string;
  loesung: string;
  erfahrung: string;
  bewertung: number;
  kosten_einordnung: Kosten | "";
  wuerde_empfehlen: boolean;
  status: ModerationStatus;
}

export interface NewReviewInput {
  workshop_id: string;
  autor_name: string;
  fahrzeug_marke: string;
  fahrzeug_modell: string;
  baujahr: number | null;
  problem_beschreibung: string;
  loesung: string;
  erfahrung: string;
  bewertung: number;
  kosten_einordnung: Kosten | "";
  wuerde_empfehlen: boolean;
}

/** Gängige Klassiker-Marken als Vorschlagsliste im Berichtsformular. */
export const FAHRZEUG_MARKEN = [
  "Alfa Romeo",
  "Audi",
  "Austin-Healey",
  "BMW",
  "Cadillac",
  "Chevrolet",
  "Citroën",
  "DKW",
  "Ferrari",
  "Fiat",
  "Ford",
  "Jaguar",
  "Lancia",
  "Mercedes-Benz",
  "MG",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Triumph",
  "Toyota",
  "Volvo",
  "VW",
] as const;
