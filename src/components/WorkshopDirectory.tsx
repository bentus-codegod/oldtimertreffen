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
  const paramsKey = params.toString();

  const [suche, setSuche] = useState(params.get("suche") ?? "");
  const [marke, setMarke] = useState(params.get("marke") ?? "");
  const [gewerk, setGewerk] = useState(params.get("gewerk") ?? "");
  const [region, setRegion] = useState(params.get("region") ?? "");
  const [sort, setSort] = useState<SortKey>("name");
  const [syncedKey, setSyncedKey] = useState(paramsKey);

  /*
   * Die URL ist die Quelle der Wahrheit für die Vorauswahl: Jedes Mal, wenn sich
   * die Adresse ändert – z. B. von der Startseite mit ?marke=Porsche herkommen,
   * eine andere Marke anklicken oder ohne Parameter auf die Seite zurückkehren –
   * werden die Filter neu aus der URL übernommen. Das behebt „immer dieselben
   * Treffer egal welche Marke“ und „Filter bleiben beim erneuten Öffnen stehen“.
   * Tippen/Auswählen auf dieser Seite ändert die URL nicht und bleibt erhalten.
   * (Zustand beim Render-Wechsel anpassen – React-Muster, kein Effekt nötig.)
   */
  if (paramsKey !== syncedKey) {
    setSyncedKey(paramsKey);
    setSuche(params.get("suche") ?? "");
    setMarke(params.get("marke") ?? "");
    setGewerk(params.get("gewerk") ?? "");
    setRegion(params.get("region") ?? "");
  }

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

  const activeChips = [
    marke ? { key: "marke", label: marke, clear: () => setMarke("") } : null,
    gewerk ? { key: "gewerk", label: gewerk, clear: () => setGewerk("") } : null,
    region ? { key: "region", label: region === "Hamburg" ? "Hamburg" : "Umland", clear: () => setRegion("") } : null,
    suche ? { key: "suche", label: `„${suche}“`, clear: () => setSuche("") } : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const hasFilter = activeChips.length > 0;

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
        className="card overflow-hidden p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="suche" className="label">
              Suche
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted">
                ⌕
              </span>
              <input
                id="suche"
                type="search"
                value={suche}
                onChange={(event) => setSuche(event.target.value)}
                placeholder="Name, Ort, Marke – oder Ihr Problem: „Vergaser W123“, „Elektrik Alfa“"
                className="input h-13 pl-11"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select id="marke" label="Marke" value={marke} onChange={setMarke} options={marken} all="Alle Marken" />
            <Select id="gewerk" label="Leistung" value={gewerk} onChange={setGewerk} options={gewerke} all="Alle Leistungen" />
            <Select id="region" label="Gebiet" value={region} onChange={setRegion} options={[...REGIONEN]} all="Hamburg & Umland" />
            <div>
              <label htmlFor="sort" className="label">
                Sortierung
              </label>
              <select id="sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="select h-13">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilter ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-sm font-semibold text-muted">Aktive Filter:</span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  {chip.label}
                  <span aria-hidden="true" className="text-base leading-none transition-transform group-hover:rotate-90">
                    ×
                  </span>
                  <span className="sr-only">entfernen</span>
                </button>
              ))}
              <button
                type="button"
                onClick={reset}
                className="ml-1 text-sm font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
              >
                Alle zurücksetzen
              </button>
            </div>
          ) : null}
        </div>
      </form>

      <p role="status" aria-live="polite" className="text-base text-muted">
        {visible.length === workshops.length ? (
          <>
            Alle <span className="font-semibold tabular-nums text-fg">{workshops.length}</span> Werkstätten
          </>
        ) : (
          <>
            <span className="font-semibold tabular-nums text-fg">{visible.length}</span> von {workshops.length}{" "}
            Werkstätten
          </>
        )}
      </p>

      {visible.length > 0 ? (
        <ul key={`${paramsKey}|${suche}|${marke}|${gewerk}|${region}|${sort}`} className="stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((workshop, i) => (
            <li
              key={workshop.id}
              className="flex h-full"
              style={{ ["--i" as string]: Math.min(i, 11) }}
            >
              <WorkshopCard workshop={workshop} summary={summaries[workshop.id]} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center">
          <p className="font-display text-2xl font-bold">Nichts gefunden.</p>
          <p className="mx-auto mt-2 max-w-prose text-base text-muted">
            Zu dieser Suche haben wir (noch) keine Werkstatt. Kennen Sie eine, die passt? Tragen Sie
            sie ein – nach kurzer Prüfung erscheint sie hier.
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
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="select h-13">
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
