import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import Reveal from "@/components/Reveal";
import { signUpAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Registrieren",
  description: "Kostenloses Konto beim Oldtimer Stammtisch anlegen – um Erfahrungsberichte zu schreiben und mitzumachen.",
  alternates: { canonical: "/registrieren" },
  robots: { index: false },
};

// Nutzer-/Session-abhängig – nicht vorab-rendern.
export const instant = false;

export default async function RegistrierenPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Reveal as="header" className="mb-6">
        <p className="kicker text-accent">Konto</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">Registrieren</h1>
        <p className="mt-3 text-lg text-muted">
          Ein Konto brauchen Sie nur, um mitzumachen – zum Stöbern nicht. Mit Konto können Sie
          Erfahrungsberichte schreiben, die dann unter Ihrem Namen erscheinen.
        </p>
      </Reveal>
      <Reveal delay={100}>
        <AuthForm mode="signup" action={signUpAction} />
      </Reveal>
    </div>
  );
}
