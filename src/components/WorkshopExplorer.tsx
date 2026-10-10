"use client";

import { useMemo, useState } from "react";
import { MARKEN, GEWERKE, type Workshop, type WorkshopFilter } from "@/lib/types";
import { countByMarke, filterWorkshops, sortWorkshops } from "@/lib/filters";
import WorkshopCard from "@/components/WorkshopCard";
import SelfEntryForm from "@/components/SelfEntryForm";
import { loadWorkshops } from "@/lib/workshops";

const emptyFilter: WorkshopFilter = { marke: "", gewerk: "", suche: "" };

export default function WorkshopExplorer({
  initialWorkshops,
  source,
}: {
  initialWorkshops: Workshop[];
  source: "supabase" | "seed";
}) {
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [filter, setFilter] = useState<WorkshopFilter>(emptyFilter);

  const sorted = useMemo(() => sortWorkshops(workshops), [workshops]);
  const visible = useMemo(() => filterWorkshops(sorted, filter), [sorted, filter]);
  const neuCount = workshops.filter((w) => w.status === "pending").length;
  const markenCount = countByMarke(workshops);

  async function refresh() {
    const { workshops: fresh } = await loadWorkshops();
    setWorkshops(fresh);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-rail px-6 py-8 text-rail-fg">
        <span className="font-mono text-xs uppercase tracking-widest text-rail-fg/70">
          Blechliebe · Werkstattfinder Hamburg
        </span>
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Wer schraubt an deinem Klassiker?
        </h1>
        <p className="max-w-2xl text-sm text-rail-fg/80">
          Oldtimer-Werkstätten in und um Hamburg, durchsuchbar nach Marke und
          Gewerk. Recherchierte Einträge sind geprüft, neue Einträge aus dem
          Formular unten erscheinen sofort — aber als ungeprüft markiert.
        </p>

        <div className="mt-2 grid grid-cols-3 gap-4 text-center">
          <Stat label="Werkstätten" value={workshops.length} />
          <Stat label="Marken" value={markenCount} />
          <Stat label="Neu / ungeprüft" value={neuCount} />
        </div>

        {source === "seed" && (
          <p className="mt-2 rounded-md bg-rail-fg/10 px-3 py-2 text-xs text-rail-fg/80">
            Demo-Modus: Daten kommen aus dem statischen Seed-Datensatz, da
            noch keine Datenbank verbunden ist.
          </p>
        )}
      </header>

      <section className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:rounded-lg sm:border sm:border-border sm:px-4">
        <select
          value={filter.marke}
          onChange={(e) => setFilter({ ...filter, marke: e.target.value })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg"
        >
          <option value="">Alle Marken</option>
          {MARKEN.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filter.gewerk}
          onChange={(e) => setFilter({ ...filter, gewerk: e.target.value })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg"
        >
          <option value="">Alle Gewerke</option>
          {GEWERKE.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Suche nach Name, Ort, PLZ…"
          value={filter.suche}
          onChange={(e) => setFilter({ ...filter, suche: e.target.value })}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg"
        />

        {(filter.marke || filter.gewerk || filter.suche) && (
          <button
            onClick={() => setFilter(emptyFilter)}
            className="rounded-md border border-border px-3 py-2 text-sm text-muted hover:text-fg"
          >
            Filter zurücksetzen
          </button>
        )}
      </section>

      <p className="-mt-6 font-mono text-xs text-muted">
        {visible.length} von {workshops.length} Werkstätten
      </p>

      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((w, i) => (
            <WorkshopCard key={w.id} workshop={w} index={i + 1} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          Keine Werkstatt passt zu diesen Filtern.
        </p>
      )}

      <SelfEntryForm onSubmitted={refresh} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-rail-fg/10 px-3 py-3">
      <div className="font-mono text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-rail-fg/70">{label}</div>
    </div>
  );
}
