import { describe, expect, it } from "vitest";
import { filterWorkshops, sortWorkshops, countByMarke } from "@/lib/filters";
import type { Workshop } from "@/lib/types";

const base: Workshop[] = [
  {
    id: "1",
    name: "Porsche Profis Hamburg",
    strasse: "Teststraße 1",
    plz: "20099",
    ort: "Hamburg",
    telefon: "",
    website: "",
    marken: ["Porsche"],
    gewerke: ["Motor"],
    hinweis: "",
    status: "verified",
  },
  {
    id: "2",
    name: "Mercedes Classics",
    strasse: "Teststraße 2",
    plz: "22525",
    ort: "Hamburg",
    telefon: "",
    website: "",
    marken: ["Mercedes-Benz"],
    gewerke: ["Lackierung", "Karosserie"],
    hinweis: "",
    status: "verified",
  },
  {
    id: "3",
    name: "Allrounder Garage",
    strasse: "Dorfstraße 5",
    plz: "25436",
    ort: "Moorrege",
    telefon: "",
    website: "",
    marken: ["Alle Marken"],
    gewerke: ["Motor", "Karosserie"],
    hinweis: "",
    status: "pending",
  },
];

describe("filterWorkshops", () => {
  it("gibt alle Werkstätten zurück, wenn kein Filter gesetzt ist", () => {
    expect(filterWorkshops(base, { marke: "", gewerk: "", suche: "" })).toHaveLength(3);
  });

  it("filtert nach Marke", () => {
    const result = filterWorkshops(base, { marke: "Porsche", gewerk: "", suche: "" });
    expect(result.map((w) => w.id)).toEqual(["1"]);
  });

  it("filtert nach Gewerk", () => {
    const result = filterWorkshops(base, { marke: "", gewerk: "Karosserie", suche: "" });
    expect(result.map((w) => w.id).sort()).toEqual(["2", "3"]);
  });

  it("kombiniert Marke und Gewerk (UND-Verknüpfung)", () => {
    const result = filterWorkshops(base, { marke: "Mercedes-Benz", gewerk: "Motor", suche: "" });
    expect(result).toHaveLength(0);
  });

  it("filtert per Freitextsuche über Name, Ort und PLZ", () => {
    expect(filterWorkshops(base, { marke: "", gewerk: "", suche: "moorrege" })).toHaveLength(1);
    expect(filterWorkshops(base, { marke: "", gewerk: "", suche: "22525" })).toHaveLength(1);
  });

  it("ist bei der Suche case-insensitive und trimmt Leerzeichen", () => {
    const result = filterWorkshops(base, { marke: "", gewerk: "", suche: "  PORSCHE  " });
    expect(result.map((w) => w.id)).toEqual(["1"]);
  });

  it("'Alle Marken' matcht nicht automatisch bei einer konkreten Markensuche", () => {
    const result = filterWorkshops(base, { marke: "Porsche", gewerk: "", suche: "" });
    expect(result.some((w) => w.id === "3")).toBe(false);
  });
});

describe("sortWorkshops", () => {
  it("sortiert nach Ort dann Name (deutsche Sortierreihenfolge)", () => {
    const sorted = sortWorkshops(base);
    expect(sorted.map((w) => w.id)).toEqual(["2", "1", "3"]);
  });

  it("verändert das Original-Array nicht", () => {
    const copy = [...base];
    sortWorkshops(base);
    expect(base).toEqual(copy);
  });
});

describe("countByMarke", () => {
  it("zählt eindeutige Marken ohne 'Alle Marken'", () => {
    expect(countByMarke(base)).toBe(2);
  });
});
