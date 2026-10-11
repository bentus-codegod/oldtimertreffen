import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import NewPasswordForm from "@/components/NewPasswordForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Neues Passwort",
  description: "Neues Passwort vergeben.",
  alternates: { canonical: "/passwort-neu" },
  robots: { index: false },
};

// Nutzer-/Session-abhängig – nicht vorab-rendern.
export const instant = false;

export default async function PasswortNeuPage() {
  // Nach Klick auf den Reset-Link besteht eine (Recovery-)Session.
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Reveal as="header" className="mb-6">
        <p className="kicker text-accent">Konto</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">
          Neues Passwort
        </h1>
        <p className="mt-3 text-lg text-muted">Vergeben Sie jetzt Ihr neues Passwort.</p>
      </Reveal>
      {user ? (
        <Reveal delay={100}>
          <NewPasswordForm />
        </Reveal>
      ) : (
        <div className="card p-6">
          <p className="text-lg">
            Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.
          </p>
          <Link href="/passwort-vergessen" className="btn-primary mt-4">
            Neuen Link anfordern
          </Link>
        </div>
      )}
    </div>
  );
}
