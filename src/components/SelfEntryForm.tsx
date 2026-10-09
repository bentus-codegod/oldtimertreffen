"use client";

import { useState } from "react";
import { MARKEN, GEWERKE } from "@/lib/types";
import { submitWorkshop } from "@/lib/workshops";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

const initialState = {
  name: "",
  strasse: "",
  plz: "",
  ort: "Hamburg",
  telefon: "",
  website: "",
  hinweis: "",
};

export default function SelfEntryForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const [fields, setFields] = useState(initialState);
  const [marken, setMarken] = useState<string[]>([]);
  const [gewerke, setGewerke] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const result = await submitWorkshop({ ...fields, marken, gewerke });

    if (result.ok) {
      setStatus("done");
      setMessage("Danke! Der Eintrag erscheint als 'Neu · ungeprüft' in der Liste.");
      setFields(initialState);
      setMarken([]);
      setGewerke([]);
      onSubmitted();
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="font-display text-xl font-medium text-fg">
        Werkstatt eintragen
      </h2>
      <p className="mt-1 text-sm text-muted">
        Kennst du eine Werkstatt, die hier fehlt? Trag sie ein — neue Einträge
        werden als &bdquo;ungeprüft&ldquo; markiert, bis sie gegengecheckt sind.
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-3 rounded-md border border-new/30 bg-new/10 px-3 py-2 text-sm text-new">
          Datenbank ist noch nicht verbunden — Einreichungen können gerade
          nicht gespeichert werden.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Name der Werkstatt *
          <input
            required
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Straße + Hausnummer *
          <input
            required
            value={fields.strasse}
            onChange={(e) => setFields({ ...fields, strasse: e.target.value })}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          PLZ *
          <input
            required
            value={fields.plz}
            onChange={(e) => setFields({ ...fields, plz: e.target.value })}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Ort
          <input
            value={fields.ort}
            onChange={(e) => setFields({ ...fields, ort: e.target.value })}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Telefon
          <input
            value={fields.telefon}
            onChange={(e) => setFields({ ...fields, telefon: e.target.value })}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Website
          <input
            value={fields.website}
            onChange={(e) => setFields({ ...fields, website: e.target.value })}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-fg">Marken</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MARKEN.map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  marken.includes(m)
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-bg text-fg"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={marken.includes(m)}
                  onChange={() => toggle(marken, m, setMarken)}
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-fg">Gewerke</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {GEWERKE.map((g) => (
              <label
                key={g}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  gewerke.includes(g)
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-bg text-fg"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={gewerke.includes(g)}
                  onChange={() => toggle(gewerke, g, setGewerke)}
                />
                {g}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Hinweis (optional)
          <textarea
            value={fields.hinweis}
            onChange={(e) => setFields({ ...fields, hinweis: e.target.value })}
            rows={2}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </label>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {status === "submitting" ? "Wird gesendet…" : "Werkstatt einreichen"}
          </button>
          {message && (
            <span
              className={`text-sm ${status === "error" ? "text-new" : "text-ok"}`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
