import {
  GEWERKE,
  KOSTEN,
  MARKEN,
  type NewReviewInput,
  type NewWorkshopInput,
} from "@/lib/types";

export type FieldErrors = Record<string, string>;

export type Validation<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldErrors };

/** Whitespace vereinheitlichen, Steuerzeichen entfernen. Zeilenumbrüche bleiben bei `multiline`. */
export function clean(value: FormDataEntryValue | null | undefined, multiline = false): string {
  if (typeof value !== "string") return "";
  let text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
  if (multiline) {
    text = text.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  } else {
    text = text.replace(/\s+/g, " ");
  }
  return text.trim();
}

function between(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

/** "https://www.example.de/" -> "www.example.de"; leere Eingabe bleibt leer; Ungültiges -> null. */
export function normalizeWebsite(raw: string): string | null {
  const text = raw.trim();
  if (!text) return "";
  const stripped = text.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (stripped.length > 120 || /\s/.test(stripped)) return null;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(stripped)) return null;
  return stripped;
}

const PHONE = /^[0-9 +()/.-]{5,30}$/;
const PLZ = /^\d{5}$/;

type FormLike = { get(name: string): FormDataEntryValue | null; getAll(name: string): FormDataEntryValue[] };

/** Honeypot: Menschen sehen das Feld nicht, Bots füllen es aus. */
export function isBot(form: FormLike): boolean {
  return clean(form.get("firma_website")).length > 0;
}

function pickAllowed(values: FormDataEntryValue[], allowed: readonly string[]): string[] {
  const set = new Set(values.filter((v): v is string => typeof v === "string"));
  return allowed.filter((a) => set.has(a));
}

export function validateWorkshop(form: FormLike): Validation<NewWorkshopInput> {
  const errors: FieldErrors = {};

  const name = clean(form.get("name"));
  const strasse = clean(form.get("strasse"));
  const plz = clean(form.get("plz"));
  const ort = clean(form.get("ort")) || "Hamburg";
  const telefon = clean(form.get("telefon"));
  const websiteRaw = clean(form.get("website"));
  const hinweis = clean(form.get("hinweis"), true);
  const marken = pickAllowed(form.getAll("marken"), MARKEN);
  const gewerke = pickAllowed(form.getAll("gewerke"), GEWERKE);

  if (!between(name, 2, 120)) errors.name = "Bitte den Namen der Werkstatt angeben (2–120 Zeichen).";
  if (!between(strasse, 3, 120)) errors.strasse = "Bitte Straße und Hausnummer angeben.";
  if (!PLZ.test(plz)) errors.plz = "Bitte eine fünfstellige Postleitzahl angeben.";
  if (!between(ort, 2, 80)) errors.ort = "Bitte den Ort angeben.";
  if (telefon && !PHONE.test(telefon)) errors.telefon = "Die Telefonnummer sieht ungewöhnlich aus.";
  const website = normalizeWebsite(websiteRaw);
  if (website === null) errors.website = "Die Internetadresse sieht ungültig aus (z. B. meine-werkstatt.de).";
  if (marken.length === 0) errors.marken = "Bitte mindestens eine Marke auswählen.";
  if (gewerke.length === 0) errors.gewerke = "Bitte mindestens ein Gewerk auswählen.";
  if (hinweis.length > 500) errors.hinweis = "Bitte höchstens 500 Zeichen.";
  if (form.get("bestaetigung") !== "on") {
    errors.bestaetigung = "Bitte bestätigen, dass die Angaben nach bestem Wissen stimmen.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { name, strasse, plz, ort, telefon, website: website ?? "", marken, gewerke, hinweis },
  };
}

export function validateReview(
  form: FormLike,
  now: Date = new Date()
): Validation<NewReviewInput> {
  const errors: FieldErrors = {};

  const workshop_id = clean(form.get("workshop_id"));
  const autor_name = clean(form.get("autor_name"));
  const fahrzeug_marke = clean(form.get("fahrzeug_marke"));
  const fahrzeug_modell = clean(form.get("fahrzeug_modell"));
  const baujahrRaw = clean(form.get("baujahr"));
  const problem_beschreibung = clean(form.get("problem_beschreibung"), true);
  const loesung = clean(form.get("loesung"), true);
  const erfahrung = clean(form.get("erfahrung"), true);
  const bewertung = Number.parseInt(clean(form.get("bewertung")), 10);
  const kostenRaw = clean(form.get("kosten_einordnung"));
  const empfehlenRaw = clean(form.get("wuerde_empfehlen"));

  if (!between(workshop_id, 1, 64)) errors.workshop_id = "Die Werkstatt konnte nicht zugeordnet werden.";
  if (autor_name.length > 40) errors.autor_name = "Bitte höchstens 40 Zeichen.";
  if (!between(fahrzeug_marke, 2, 40)) errors.fahrzeug_marke = "Bitte die Fahrzeugmarke angeben.";
  if (!between(fahrzeug_modell, 1, 60)) errors.fahrzeug_modell = "Bitte das Modell angeben (z. B. W123 280 E).";

  let baujahr: number | null = null;
  if (baujahrRaw) {
    const year = Number.parseInt(baujahrRaw, 10);
    if (!/^\d{4}$/.test(baujahrRaw) || year < 1900 || year > now.getFullYear()) {
      errors.baujahr = "Bitte ein gültiges Baujahr angeben (z. B. 1974).";
    } else {
      baujahr = year;
    }
  }

  if (!between(problem_beschreibung, 15, 1500)) {
    errors.problem_beschreibung = "Bitte das Problem beschreiben (mindestens 15 Zeichen).";
  }
  if (loesung.length > 1500) errors.loesung = "Bitte höchstens 1500 Zeichen.";
  if (!between(erfahrung, 20, 1500)) {
    errors.erfahrung = "Bitte kurz schildern, wie es gelaufen ist (mindestens 20 Zeichen).";
  }
  if (!Number.isInteger(bewertung) || bewertung < 1 || bewertung > 5) {
    errors.bewertung = "Bitte eine Bewertung von 1 bis 5 Sternen wählen.";
  }

  const kostenValues: readonly string[] = KOSTEN.map((k) => k.value);
  if (kostenRaw && !kostenValues.includes(kostenRaw)) errors.kosten_einordnung = "Ungültige Auswahl.";
  if (empfehlenRaw !== "ja" && empfehlenRaw !== "nein") {
    errors.wuerde_empfehlen = "Bitte angeben, ob du die Werkstatt weiterempfehlen würdest.";
  }
  if (form.get("bestaetigung") !== "on") {
    errors.bestaetigung = "Bitte bestätigen, dass du selbst Kunde der Werkstatt warst.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      workshop_id,
      autor_name,
      fahrzeug_marke,
      fahrzeug_modell,
      baujahr,
      problem_beschreibung,
      loesung,
      erfahrung,
      bewertung,
      kosten_einordnung: (kostenRaw as NewReviewInput["kosten_einordnung"]) || "",
      wuerde_empfehlen: empfehlenRaw === "ja",
    },
  };
}
