import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import Reveal from "@/components/Reveal";
import { FormMessage } from "@/components/FormParts";
import { signInAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Anmelden",
  description: "Beim Oldtimer Stammtisch anmelden.",
  alternates: { canonical: "/anmelden" },
  robots: { index: false },
};

// Nutzer-/Session-abhängig – nicht vorab-rendern.
export const instant = false;

export default async function AnmeldenPage({ searchParams }: PageProps<"/anmelden">) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const sp = await searchParams;
  const fehler = typeof sp.fehler === "string" ? sp.fehler : undefined;
  const geloescht = sp.geloescht === "1";
  const nextRaw = typeof sp.next === "string" ? sp.next : undefined;
  const nextPath = nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : undefined;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Reveal as="header" className="mb-6">
        <p className="kicker text-accent">Konto</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">Anmelden</h1>
        <p className="mt-3 text-lg text-muted">Willkommen zurück am Stammtisch.</p>
      </Reveal>
      {fehler === "bestaetigung" ? (
        <div className="mb-4">
          <FormMessage
            status="error"
            message="Der Bestätigungslink ist ungültig oder abgelaufen. Bitte melden Sie sich an – wir schicken Ihnen bei Bedarf einen neuen Link."
          />
        </div>
      ) : null}
      {geloescht ? (
        <div className="mb-4">
          <FormMessage status="success" message="Ihr Konto wurde gelöscht. Danke, dass Sie dabei waren." />
        </div>
      ) : null}
      <Reveal delay={100}>
        <AuthForm mode="signin" action={signInAction} nextPath={nextPath} />
      </Reveal>
      <p className="mt-4 text-sm text-muted">
        <Link href="/passwort-vergessen" className="font-semibold text-accent">
          Passwort vergessen?
        </Link>
      </p>
    </div>
  );
}
