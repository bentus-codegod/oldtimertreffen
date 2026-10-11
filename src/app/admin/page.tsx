import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/admin/LoginForm";
import {
  approveReview,
  approveWorkshop,
  logoutAction,
  rejectReview,
  rejectWorkshop,
} from "@/app/admin/actions";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabaseAdmin";
import type { Review, WorkshopRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Prüfbereich",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Prüfbereich</h1>
      <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-lg bg-surface-2" />}>
        <AdminGate />
      </Suspense>
    </div>
  );
}

async function AdminGate() {
  if (!isAdminConfigured()) {
    return (
      <div className="card mt-6 p-6 text-base">
        <p className="font-semibold">Der Prüfbereich ist noch nicht eingerichtet.</p>
        <p className="mt-2 text-muted">
          Setzen Sie in Vercel (und lokal in .env.local) die Variablen ADMIN_PASSWORD,
          ADMIN_SESSION_SECRET und SUPABASE_SERVICE_ROLE_KEY – siehe README. Bis dahin können Sie
          Einträge auch direkt im Supabase Table Editor freigeben (status auf „verified“ setzen).
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) {
    return (
      <div className="mt-6">
        <p className="mb-4 text-base text-muted">Nur für die Betreiber der Seite.</p>
        <LoginForm />
      </div>
    );
  }
  return <Queue />;
}

async function Queue() {
  const admin = getAdminClient();
  if (!admin) return <p className="mt-6 text-warn">Datenbank-Zugang fehlt.</p>;

  const [workshopsRes, reviewsRes, namesRes] = await Promise.all([
    admin.from("workshops").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin.from("reparaturfaelle").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin.from("workshops").select("id, name"),
  ]);

  const workshops = (workshopsRes.data ?? []) as (WorkshopRecord & { created_at: string })[];
  const reviews = (reviewsRes.data ?? []) as Review[];
  const names = new Map((namesRes.data ?? []).map((w: { id: string; name: string }) => [w.id, w.name]));
  const error = workshopsRes.error ?? reviewsRes.error;

  return (
    <div className="mt-6 flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-muted">
          {workshops.length} Werkstätten und {reviews.length} Berichte warten auf Prüfung.
        </p>
        <form action={logoutAction}>
          <button type="submit" className="btn-outline min-h-11 py-1.5">
            Abmelden
          </button>
        </form>
      </div>

      {error ? <p role="alert" className="error-text">Fehler beim Laden: {error.message}</p> : null}

      <section aria-labelledby="q-werkstaetten">
        <h2 id="q-werkstaetten" className="font-display text-2xl font-bold uppercase tracking-wide">
          Neue Werkstätten
        </h2>
        {workshops.length === 0 ? (
          <p className="mt-3 text-base text-muted">Nichts zu prüfen.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {workshops.map((w) => (
              <li key={w.id} className="card p-5">
                <h3 className="font-display text-xl font-bold">{w.name}</h3>
                <p className="text-base">{w.strasse}, {w.plz} {w.ort}</p>
                <p className="text-base text-muted">
                  Tel: {w.telefon || "–"} · Web: {w.website || "–"}
                </p>
                <p className="mt-2 text-base"><strong>Marken:</strong> {w.marken.join(", ")}</p>
                <p className="text-base"><strong>Leistungen:</strong> {w.gewerke.join(", ")}</p>
                {w.hinweis ? <p className="mt-1 whitespace-pre-line text-base"><strong>Hinweis:</strong> {w.hinweis}</p> : null}
                <ModerationButtons id={w.id} approve={approveWorkshop} reject={rejectWorkshop} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="q-berichte">
        <h2 id="q-berichte" className="font-display text-2xl font-bold uppercase tracking-wide">
          Neue Erfahrungsberichte
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-base text-muted">Nichts zu prüfen.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <h3 className="font-display text-xl font-bold">
                  {r.fahrzeug_marke} {r.fahrzeug_modell}
                  {r.baujahr ? ` (Bj. ${r.baujahr})` : ""}
                </h3>
                <p className="text-base text-muted">
                  bei {names.get(r.workshop_id) ?? "unbekannter Werkstatt"} · {r.bewertung}/5 Sterne ·{" "}
                  {r.wuerde_empfehlen ? "empfiehlt" : "empfiehlt nicht"} · von {r.autor_name || "anonym"}
                </p>
                <p className="mt-2 whitespace-pre-line text-base"><strong>Problem:</strong> {r.problem_beschreibung}</p>
                {r.loesung ? <p className="mt-1 whitespace-pre-line text-base"><strong>Lösung:</strong> {r.loesung}</p> : null}
                <p className="mt-1 whitespace-pre-line text-base"><strong>Erfahrung:</strong> {r.erfahrung}</p>
                <ModerationButtons id={r.id} approve={approveReview} reject={rejectReview} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ModerationButtons({
  id,
  approve,
  reject,
}: {
  id: string;
  approve: (formData: FormData) => Promise<void>;
  reject: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <form action={approve}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="btn-primary">Freigeben</button>
      </form>
      <form action={reject}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="btn-outline text-warn">Ablehnen &amp; löschen</button>
      </form>
    </div>
  );
}
