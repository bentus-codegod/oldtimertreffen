import type { MetadataRoute } from "next";
import { getWorkshops } from "@/lib/data";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { workshops } = await getWorkshops();
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/werkstaetten`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/eintragen`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...workshops.map((w) => ({
      url: `${SITE.url}/werkstatt/${w.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
