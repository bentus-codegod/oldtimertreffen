import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SEED_WORKSHOPS } from "@/data/seed-workshops";
import { createSessionToken, verifySessionToken } from "@/lib/admin-auth";
import { mapsHref, toTelHref, websiteHref } from "@/components/ContactActions";
import { groupByWorkshop, summarize } from "@/lib/reviews";
import { slugify, withSlugs } from "@/lib/slug";
import type { Review } from "@/lib/types";

function review(partial: Partial<Review>): Review {
  return {
    id: "r",
    created_at: "2026-01-01T00:00:00Z",
    workshop_id: "w1",
    autor_name: "",
    fahrzeug_marke: "BMW",
    fahrzeug_modell: "2002",
    baujahr: null,
    problem_beschreibung: "Problem Problem",
    loesung: "",
    erfahrung: "Erfahrung Erfahrung",
    bewertung: 5,
    kosten_einordnung: "",
    wuerde_empfehlen: true,
    status: "verified",
    ...partial,
  };
}

describe("slugs", () => {
  it("resolves umlauts, ampersands and punctuation", () => {
    expect(slugify("Mirbach & Seemann GmbH")).toBe("mirbach-und-seemann-gmbh");
    expect(slugify("Müller Öl-Straße")).toBe("mueller-oel-strasse");
  });

  it("gives every seed workshop a unique, URL-safe slug", () => {
    const slugs = withSlugs(SEED_WORKSHOPS).map((w) => w.slug);
    expect(new Set(slugs).size).toBe(SEED_WORKSHOPS.length);
    expect(slugs.every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s))).toBe(true);
  });

  it("disambiguates identical name + city", () => {
    const base = SEED_WORKSHOPS[0];
    const [a, b] = withSlugs([base, { ...base, id: "other" }]);
    expect(a.slug).not.toBe(b.slug);
  });
});

describe("reviews", () => {
  it("summarizes average and recommendation share", () => {
    const s = summarize([
      review({ bewertung: 5 }),
      review({ bewertung: 4 }),
      review({ bewertung: 2, wuerde_empfehlen: false }),
    ]);
    expect(s).toEqual({ count: 3, average: 3.7, recommendPercent: 67 });
  });

  it("returns an empty summary and groups by workshop", () => {
    expect(summarize([]).count).toBe(0);
    const grouped = groupByWorkshop([review({ workshop_id: "a" }), review({ workshop_id: "b" }), review({ workshop_id: "a" })]);
    expect(grouped.get("a")).toHaveLength(2);
  });
});

describe("contact links", () => {
  it("builds international tel: links", () => {
    expect(toTelHref("040 5550 3839")).toBe("tel:+4940 55503839".replace(" ", ""));
    expect(toTelHref("+49 40 123")).toBe("tel:+4940123");
  });

  it("adds https only when missing and builds a maps route", () => {
    expect(websiteHref("example.de")).toBe("https://example.de");
    expect(websiteHref("http://example.de")).toBe("http://example.de");
    expect(mapsHref({ name: "A & B", strasse: "Weg 1", plz: "22045", ort: "Hamburg (Tonndorf)" })).toContain(
      encodeURIComponent("A & B, Weg 1, 22045 Hamburg")
    );
  });
});

describe("admin session tokens", () => {
  const original = process.env.ADMIN_SESSION_SECRET;
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
  });
  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = original;
  });

  it("accepts a fresh token and rejects tampering, expiry and junk", () => {
    const now = 1_000_000;
    const { token } = createSessionToken(now);
    expect(verifySessionToken(token, now + 1000)).toBe(true);
    expect(verifySessionToken(token, now + 13 * 3600 * 1000)).toBe(false);
    const [payload] = token.split(".");
    expect(verifySessionToken(`${Number(payload) + 5000}.${token.split(".")[1]}`, now)).toBe(false);
    expect(verifySessionToken(undefined, now)).toBe(false);
    expect(verifySessionToken("garbage", now)).toBe(false);
  });

  it("rejects every token when no secret is configured", () => {
    const { token } = createSessionToken(1);
    delete process.env.ADMIN_SESSION_SECRET;
    expect(verifySessionToken(token, 2)).toBe(false);
  });
});
