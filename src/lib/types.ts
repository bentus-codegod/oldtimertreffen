export type WorkshopStatus = "verified" | "pending";

export interface Workshop {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  website: string;
  marken: string[];
  gewerke: string[];
  hinweis: string;
  status: WorkshopStatus;
}

export const MARKEN = [
  "Mercedes-Benz",
  "Porsche",
  "US-Cars",
  "Jaguar / Britisch",
  "Alfa Romeo / Italienisch",
  "Toyota",
  "Alle Marken",
] as const;

export const GEWERKE = [
  "Karosserie",
  "Lackierung",
  "Motor",
  "Elektrik",
  "Sattlerei / Interieur",
  "Restaurierung komplett",
  "Ersatzteile / Zubehör",
  "Handel",
] as const;

export interface WorkshopFilter {
  marke: string;
  gewerk: string;
  suche: string;
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
