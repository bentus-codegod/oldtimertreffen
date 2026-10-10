import type { ReactNode } from "react";

export const str = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
export const arr = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : v ? [v] : [];

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required ? (
          <span className="text-warn" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckGroup({
  legend,
  name,
  options,
  selected,
  error,
  hint,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  selected: string[];
  error?: string;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="label">
        {legend}
        <span className="text-warn" aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      {hint ? <p className="hint mb-2 mt-0">{hint}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-2 text-base has-[:checked]:border-accent has-[:checked]:bg-accent/10"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selected.includes(option)}
              className="size-5 shrink-0 accent-[var(--accent)]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="error-text">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Unsichtbares Lockfeld gegen Bots – Menschen sehen und füllen es nicht aus. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Bitte leer lassen
        <input type="text" name="firma_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormMessage({
  status,
  message,
}: {
  status: "idle" | "success" | "error";
  message?: string;
}) {
  if (status === "idle" || !message) return null;
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`rounded-md border px-4 py-3 text-base font-medium ${
        status === "success"
          ? "border-ok/40 bg-ok/10 text-ok"
          : "border-warn/40 bg-warn/10 text-warn"
      }`}
    >
      {message}
    </p>
  );
}
