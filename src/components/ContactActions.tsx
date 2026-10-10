import type { Workshop } from "@/lib/types";

/** "040 5550 3839" -> "+4940 …" – für tel:-Links, die auch im Ausland funktionieren. */
export function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("0") ? `+49${digits.slice(1)}` : digits}`;
}

export function mapsHref(w: Pick<Workshop, "name" | "strasse" | "plz" | "ort">): string {
  const ort = w.ort.replace(/\(.*\)/, "").trim();
  const query = `${w.name}, ${w.strasse}, ${w.plz} ${ort}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function websiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

/** Große Aktions-Buttons (Anrufen, Route, Website) – bewusst gut treffbar am Handy. */
export default function ContactActions({ workshop }: { workshop: Workshop }) {
  return (
    <div className="flex flex-wrap gap-3">
      {workshop.telefon ? (
        <a href={toTelHref(workshop.telefon)} className="btn-primary">
          <span aria-hidden="true">☎</span> Anrufen
          <span className="font-normal opacity-90">· {workshop.telefon}</span>
        </a>
      ) : null}
      <a href={mapsHref(workshop)} target="_blank" rel="noopener noreferrer" className="btn-outline">
        <span aria-hidden="true">➤</span> Route planen
      </a>
      {workshop.website ? (
        <a
          href={websiteHref(workshop.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          <span aria-hidden="true">↗</span> Website
        </a>
      ) : null}
    </div>
  );
}
