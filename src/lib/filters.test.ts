import { describe, expect, it } from "vitest";
import {
  availableMarken,
  countByMarke,
  filterWorkshops,
  regionOf,
  sortWorkshops,
} from "@/lib/filters";
import type { Workshop } from "@/lib/types";

function make(partial: Partial<Workshop> & Pick<Workshop, "id" | "name">): Workshop {
  return {
    slug: partial.id,
    strasse: "Teststraße 1",
    plz: "20099",
    ort: "Hamburg",
    telefon: "",
    website: "",
    marken: [],
    gewerke: [],
    hinweis: "",
    status: "verified",
    ...partial,
  };
}

const porsche = make({ id: "1", name: "Porsche Profis", marken: ["Porsche"], gewerke: ["Motor"] });
const mercedes = make({
  id: "2",
  name: "Mercedes Classics",
  ort: "Hamburg (Tonndorf)",
  marken: ["Mercedes-Benz"],
  gewerke: ["Lackierung", "Karosserie"],
});
const alle = make({
  id: "3",
  name: "Ärmel Allrounder",
  ort: "Moorrege",
  marken: ["Alle Marken"],
  gewerke: ["Motor", "Elektrik"],
});
const all = [porsche, mercedes, alle];
const none = { marke: "", gewerk: "", suche: "" };

describe("filterWorkshops", () => {
  it("returns everything without filters", () => {
    expect(filterWorkshops(all, none)).toHaveLength(3);
  });

  it("filters by marke and gewerk", () => {
    expect(filterWorkshops(all, { ...none, marke: "Porsche" })).toEqual([porsche]);
    expect(filterWorkshops(all, { ...none, gewerk: "Motor" }).map((w) => w.id)).toEqual(["1", "3"]);
    expect(filterWorkshops(all, { ...none, marke: "Porsche", gewerk: "Elektrik" })).toEqual([]);
  });

  it("filters by region (Hamburg incl. Stadtteile vs. Umland)", () => {
    expect(filterWorkshops(all, { ...none, region: "Hamburg" }).map((w) => w.id)).toEqual(["1", "2"]);
    expect(filterWorkshops(all, { ...none, region: "Umland" })).toEqual([alle]);
  });

  it("matches free text case-insensitively across fields", () => {
    expect(filterWorkshops(all, { ...none, suche: "moorrege" })).toEqual([alle]);
    expect(filterWorkshops(all, { ...none, suche: "  PORSCHE " })).toEqual([porsche]);
  });

  it("requires every search word (AND, any order)", () => {
    expect(filterWorkshops(all, { ...none, suche: "motor porsche" })).toEqual([porsche]);
    expect(filterWorkshops(all, { ...none, suche: "motor lackierung" })).toEqual([]);
  });

  it("also searches the extra text (e.g. repair reports)", () => {
    const extra = { "2": "W123 Vergaser überholt" };
    expect(filterWorkshops(all, { ...none, suche: "vergaser w123" }, extra)).toEqual([mercedes]);
    expect(filterWorkshops(all, { ...none, suche: "vergaser" })).toEqual([]);
  });

  it("combines filters and search", () => {
    expect(filterWorkshops(all, { marke: "Porsche", gewerk: "Motor", suche: "profis" })).toEqual([porsche]);
  });
});

describe("regionOf", () => {
  it("treats Hamburg districts as Hamburg and everything else as Umland", () => {
    expect(regionOf({ ort: "Hamburg" })).toBe("Hamburg");
    expect(regionOf({ ort: "Hamburg (Hummelsbüttel)" })).toBe("Hamburg");
    expect(regionOf({ ort: "Norderstedt" })).toBe("Umland");
  });
});

describe("sortWorkshops", () => {
  it("sorts by name with German collation (Ä next to A)", () => {
    expect(sortWorkshops(all).map((w) => w.name)).toEqual([
      "Ärmel Allrounder",
      "Mercedes Classics",
      "Porsche Profis",
    ]);
  });

  it("sorts by rating, then name", () => {
    const summaries = {
      "1": { count: 1, average: 4, recommendPercent: 100 },
      "2": { count: 2, average: 5, recommendPercent: 100 },
    };
    expect(sortWorkshops(all, "bewertung", summaries).map((w) => w.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts by number of reports", () => {
    const summaries = {
      "3": { count: 7, average: 3, recommendPercent: 50 },
      "1": { count: 2, average: 5, recommendPercent: 100 },
    };
    expect(sortWorkshops(all, "berichte", summaries).map((w) => w.id)).toEqual(["3", "1", "2"]);
  });

  it("does not mutate the input", () => {
    const copy = [...all];
    sortWorkshops(all, "name");
    expect(all).toEqual(copy);
  });
});

describe("marken helpers", () => {
  it("counts concrete brands without 'Alle Marken'", () => {
    expect(countByMarke(all)).toBe(2);
  });

  it("lists available marken alphabetically with 'Alle Marken' last", () => {
    expect(availableMarken(all)).toEqual(["Mercedes-Benz", "Porsche", "Alle Marken"]);
  });
});
