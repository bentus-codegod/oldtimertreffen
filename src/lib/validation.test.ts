import { describe, expect, it } from "vitest";
import { clean, isBot, normalizeWebsite, validateReview, validateWorkshop } from "@/lib/validation";

function form(entries: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const validWorkshop = {
  name: "Schrauber & Söhne",
  strasse: "Werkstattweg 7",
  plz: "22525",
  ort: "Hamburg",
  telefon: "040 123456",
  website: "https://www.schrauber.de/",
  marken: ["Porsche", "Alle Marken"],
  gewerke: ["Motor"],
  hinweis: "Spezialist für Luftgekühlte",
  bestaetigung: "on",
};

const validReview = {
  workshop_id: "abc-123",
  fahrzeug_marke: "Mercedes-Benz",
  fahrzeug_modell: "W123 280 E",
  baujahr: "1979",
  problem_beschreibung: "Springt kalt schlecht an und geht aus.",
  loesung: "Einspritzventile gereinigt.",
  erfahrung: "Termin eingehalten, ehrliche Beratung, fairer Preis.",
  bewertung: "5",
  kosten_einordnung: "fair",
  wuerde_empfehlen: "ja",
  bestaetigung: "on",
};

describe("clean / normalizeWebsite / isBot", () => {
  it("collapses whitespace and strips control characters", () => {
    expect(clean("  Hallo \n  Welt\u0000 ")).toBe("Hallo Welt");
    expect(clean("a\r\n\r\n\r\n\r\nb", true)).toBe("a\n\nb");
    expect(clean(null)).toBe("");
  });

  it("normalizes websites and rejects junk", () => {
    expect(normalizeWebsite("https://www.example.de/")).toBe("www.example.de");
    expect(normalizeWebsite("example.de")).toBe("example.de");
    expect(normalizeWebsite("")).toBe("");
    expect(normalizeWebsite("kein link")).toBeNull();
    expect(normalizeWebsite("javascript:alert(1)")).toBeNull();
  });

  it("detects the honeypot", () => {
    expect(isBot(form({ firma_website: "http://spam" }))).toBe(true);
    expect(isBot(form({ firma_website: "" }))).toBe(false);
  });
});

describe("validateWorkshop", () => {
  it("accepts a complete submission and normalizes it", () => {
    const result = validateWorkshop(form(validWorkshop));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.website).toBe("www.schrauber.de");
      expect(result.value.marken).toEqual(["Porsche", "Alle Marken"]);
    }
  });

  it("defaults the city to Hamburg", () => {
    const result = validateWorkshop(form({ ...validWorkshop, ort: "" }));
    expect(result.ok && result.value.ort).toBe("Hamburg");
  });

  it("collects errors for every invalid field", () => {
    const result = validateWorkshop(
      form({ name: "x", strasse: "", plz: "12", marken: [], gewerke: [], telefon: "abc", website: "kaputt link" })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ["bestaetigung", "gewerke", "marken", "name", "plz", "strasse", "telefon", "website"].sort()
      );
    }
  });

  it("ignores marken/gewerke that are not in the allowed lists", () => {
    const result = validateWorkshop(form({ ...validWorkshop, marken: ["Porsche", "<script>"] }));
    expect(result.ok && result.value.marken).toEqual(["Porsche"]);
  });

  it("requires the confirmation checkbox", () => {
    const { bestaetigung: _omit, ...rest } = validWorkshop;
    void _omit;
    const result = validateWorkshop(form(rest));
    expect(!result.ok && result.errors.bestaetigung).toBeTruthy();
  });
});

describe("validateReview", () => {
  it("accepts a complete review", () => {
    const result = validateReview(form(validReview));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.baujahr).toBe(1979);
      expect(result.value.bewertung).toBe(5);
      expect(result.value.wuerde_empfehlen).toBe(true);
    }
  });

  it("treats baujahr and kosten as optional", () => {
    const result = validateReview(form({ ...validReview, baujahr: "", kosten_einordnung: "", loesung: "" }));
    expect(result.ok && result.value.baujahr).toBeNull();
  });

  it("rejects out-of-range years and ratings", () => {
    const now = new Date("2026-10-10");
    const future = validateReview(form({ ...validReview, baujahr: "2031" }), now);
    expect(!future.ok && future.errors.baujahr).toBeTruthy();
    const old = validateReview(form({ ...validReview, baujahr: "1850" }), now);
    expect(!old.ok && old.errors.baujahr).toBeTruthy();
    const stars = validateReview(form({ ...validReview, bewertung: "6" }), now);
    expect(!stars.ok && stars.errors.bewertung).toBeTruthy();
  });

  it("requires problem, experience, recommendation and confirmation", () => {
    const result = validateReview(
      form({ workshop_id: "x", fahrzeug_marke: "BMW", fahrzeug_modell: "2002", bewertung: "4" })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ["bestaetigung", "erfahrung", "problem_beschreibung", "wuerde_empfehlen"].sort()
      );
    }
  });

  it("rejects unknown cost values and too-long texts", () => {
    const cost = validateReview(form({ ...validReview, kosten_einordnung: "gratis" }));
    expect(!cost.ok && cost.errors.kosten_einordnung).toBeTruthy();
    const long = validateReview(form({ ...validReview, erfahrung: "x".repeat(1501) }));
    expect(!long.ok && long.errors.erfahrung).toBeTruthy();
  });
});
