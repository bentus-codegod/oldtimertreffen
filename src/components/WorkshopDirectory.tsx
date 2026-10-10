"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WorkshopCard from "@/components/WorkshopCard";
import { availableGewerke, availableMarken, filterWorkshops, sortWorkshops } from "@/lib/filters";
import type { ReviewSummary } from "@/lib/reviews";
import { REGIONEN, type SortKey, type Workshop } from "@/lib/types";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name (A–Z)" },
  { value: "bewertung", label: "Beste Bewertung" },
  { value: "berichte", label: "Meiste Erfahrungsberichte" },
];

export default function WorkshopDirectory({
  workshops,
  summaries,
  extraText,
}: {
  workshops: Workshop[];
  summaries: Record<string, ReviewSummary>;
  extraText: Record<string, string>;
}) {
  const params = useSearchParams();
  const [suche, setSuche] = useState(params.get("suche") ?? "");
  const [marke, setMarke] = useState(params.get("marke") ?? "");
  const [gewerk, setGewerk] = useState(params.get("gewerk") ?? "");
  const [region, setRegion] = useState(params.get("region") ?? "");
  const [sort, setSort] = useState<SortKey>("name");

  const marken = useMemo(() => availableMarken(workshops), [workshops]);
  const gewerke = useMemo(() => availableGewerke(workshops), [workshops]);

  const visible = useMemo(
    () =>
      sortWorkshops(
        filterWorkshops(workshops, { suche, marke, gewerk, region }, extraText),
        sort,
        summaries
      ),
    [workshops, suche, marke, gewerk, region, sort, extraText, summaries]
  );

  const hasFilter = Boolean(suche || marke || gewerk || region);

  function reset() {
    setSuche("");
    setMarke("");
    setGewerk("");
    setRegion("");
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        aria-label="Werkstätten filtern"
        onSubmit={(event) => event.preventDefault()}
        className="card grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="suche" className="label">
            Suche
          </label>
          <input
            id="suche"
            type="search"
            value={suche}
            onChange={(event) => setSuche(event.target.value)}
            placeholder="Name, Ort, Marke – oder dein Problem: „Vergaser W123“, „Elektrik Alfa“"
            className="input"
            autoComplete="off"
          />
        </div>
        <Select id="marke" label="Marke" value={marke} onChange={setMarke} options={marken} all="Alle Marken" />
        <Select id="gewerk" label="Leistung" value={gewerk} onChange={setGewerk} options={gewerke} all="Alle Leistungen" />
        <Select id="region" label="Gebiet" value={region} onChange={setRegion} options={[...REGIONEN]} all="Hamburg & Umland" />
        <div>
          <label htmlFor="sort" className="label">
            Sortierung
          </label>
          <select id="sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="input">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-base text-muted">
          {visible.length === workshops.length
            ? `Alle ${workshops.length} Werkstätten`
            : `${visible.length} von ${workshops.length} Werkstätten`}
        </p>
        {hasFilter ? (
          <button type="button" onClick={reset} className="btn-outline min-h-11 py-1.5">
            Filter zurücksetzen
          </button>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((workshop) => (
            <li key={workshop.id} className="flex">
              <div className="flex w-full">
                <WorkshopCard workshop={workshop} summary={summaries[workshop.id]} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center">
          <p className="font-display text-2xl font-bold">Nichts gefunden.</p>
          <p className="mx-auto mt-2 max-w-prose text-base text-muted">
            Zu dieser Suche haben wir (noch) keine Werkstatt. Kennst du eine, die passt? Trag sie ein –
            nach kurzer Prüfung erscheint sie hier.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn-outline">
              Filter zurücksetzen
            </button>
            <Link href="/eintragen" className="btn-primary">
              Werkstatt eintragen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
  all,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  all: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="input">
        <option value="">{all}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
