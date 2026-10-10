/** Reine Anzeige von Sternen (1–5); der Wert steht zusätzlich als Text für Screenreader. */
export default function Stars({ value, className = "" }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-center ${className}`} role="img" aria-label={`${value} von 5 Sternen`}>
      <span aria-hidden="true" className="tracking-[0.12em] text-star">
        {"★".repeat(rounded)}
        <span className="text-border">{"★".repeat(Math.max(0, 5 - rounded))}</span>
      </span>
    </span>
  );
}
