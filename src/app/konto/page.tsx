import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Reveal from "@/components/Reveal";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import { FormMessage } from "@/components/FormParts";
import { signOutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mein Konto",
  description: "Kontoeinstellungen beim Oldtimer Stammtisch.",
  alternates: { canonical: "/konto" },
  robots: { index: false },
};

// Nutzer-/Session-abhängig – nicht vorab-rendern.
export const instant = false;

export default async function KontoPage({ searchParams }: PageProps<"/konto">) {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden?next=/konto");

  const sp = await searchParams;
  const pwChanged = sp.pw === "geaendert";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Reveal as="header" className="mb-8">
        <p className="kicker text-accent">Konto</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">Mein Konto</h1>
      </Reveal>

      {pwChanged ? (
        <div className="mb-6">
          <FormMessage status="success" message="Ihr neues Passwort ist gespeichert." />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <Reveal as="section" className="card p-6">
          <h2 className="font-display text-2xl font-bold">Zugangsdaten</h2>
          <p className="mt-2 text-base">
            Angemeldet als <strong>{user.email}</strong>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/passwort-vergessen" className="btn-outline">
              Passwort ändern
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="btn-outline">
                Abmelden
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal as="section" delay={80} className="card border-warn/40 p-6">
          <h2 className="font-display text-2xl font-bold text-warn">Konto löschen</h2>
          <p className="mt-2 text-base text-muted">
            Dabei werden Ihr Konto und alle Ihre Erfahrungsberichte dauerhaft entfernt. Das lässt sich
            nicht rückgängig machen.
          </p>
          <div className="mt-4">
            <DeleteAccountForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
