import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PasswordResetForm from "@/components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Passwort vergessen",
  description: "Passwort beim Oldtimer Stammtisch zurücksetzen.",
  alternates: { canonical: "/passwort-vergessen" },
  robots: { index: false },
};

export default function PasswortVergessenPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Reveal as="header" className="mb-6">
        <p className="kicker text-accent">Konto</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">
          Passwort vergessen
        </h1>
        <p className="mt-3 text-lg text-muted">
          Geben Sie Ihre E-Mail-Adresse ein – wir schicken Ihnen einen Link, über den Sie ein neues
          Passwort vergeben können.
        </p>
      </Reveal>
      <Reveal delay={100}>
        <PasswordResetForm />
      </Reveal>
      <p className="mt-4 text-sm text-muted">
        <Link href="/anmelden" className="font-semibold text-accent">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
