import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactActions from "@/components/ContactActions";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";
import { getReviews, getWorkshopBySlug, getWorkshops } from "@/lib/data";
import { summarize } from "@/lib/reviews";
import { SITE } from "@/lib/site";
import type { Review, Workshop } from "@/lib/types";

export async function generateStaticParams() {
  const { workshops } = await getWorkshops();
  return workshops.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/werkstatt/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) return { title: "Werkstatt nicht gefunden" };

  const marken = workshop.marken.join(", ");
  return {
    title: `${workshop.name} – ${workshop.ort}`,
    description: `${workshop.name} in ${workshop.plz} ${workshop.ort}: ${workshop.gewerke.join(", ")}. Marken: ${marken}. Erfahrungsberichte von Oldtimer-Besitzern.`,
    alternates: { canonical: `/werkstatt/${workshop.slug}` },
  };
}

export default async function WerkstattPage({ params }: PageProps<"/werkstatt/[slug]">) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) notFound();

  const all = await getReviews();
  const reviews = all.filter((r) => r.workshop_id === workshop.id);
  const summary = summarize(reviews);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Brotkrumen" className="mb-5 text-base text-muted">
        <Link href="/werkstaetten">← Alle Werkstätten</Link>
      </nav>

      <header className="card flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <p className="kicker text-accent">
            {workshop.ort.replace(/\(.*\)/, "").trim()} · {workshop.plz}
          </p>
          <h1 className="mt-2 text-balance font-display text-4xl font-bold leading-tight sm:text-5xl">
            {workshop.name}
          </h1>
          <p className="mt-2 text-lg text-muted">
            {workshop.strasse}, {workshop.plz} {workshop.ort}
          </p>
        </div>

        {summary.count > 0 ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg">
            <Stars value={summary.average} className="text-2xl" />
            <span className="font-semibold">{summary.average.toLocaleString("de-DE")}</span>
            <span className="text-muted">
              · {summary.count} {summary.count === 1 ? "Erfahrungsbericht" : "Erfahrungsberichte"} ·{" "}
              {summary.recommendPercent} % würden sie empfehlen
            </span>
          </p>
        ) : null}

        <ContactActions workshop={workshop} />

        {workshop.hinweis ? (
          <p className="rounded-md bg-warn/10 px-4 py-3 text-base text-warn">{workshop.hinweis}</p>
        ) : null}
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-6" aria-labelledby="marken-h">
          <h2 id="marken-h" className="font-display text-2xl font-bold uppercase tracking-wide">
            Marken
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {workshop.marken.map((m) => (
              <li key={m} className="chip text-base">
                {m}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-6" aria-labelledby="leistungen-h">
          <h2 id="leistungen-h" className="font-display text-2xl font-bold uppercase tracking-wide">
            Leistungen
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {workshop.gewerke.map((g) => (
              <li key={g} className="chip text-base">
                {g}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="berichte-h" id="berichte">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="berichte-h" className="font-display text-3xl font-bold uppercase tracking-wide">
            Erfahrungen am Stammtisch
          </h2>
          <a href="#bericht-schreiben" className="btn-outline">
            Eigene Erfahrung teilen
          </a>
        </div>
        <ReviewsList reviews={reviews} />
      </section>

      <section className="mt-12 scroll-mt-6" aria-labelledby="schreiben-h" id="bericht-schreiben">
        <h2 id="schreiben-h" className="font-display text-3xl font-bold uppercase tracking-wide">
          Deine Erfahrung teilen
        </h2>
        <div className="mt-4 max-w-3xl">
          <ReviewForm workshopId={workshop.id} workshopName={workshop.name} />
        </div>
      </section>

      <script
        type="application/ld+json"
        // "<" wird escaped, damit eingetragene Texte das Script-Tag nie schließen können.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(workshop, summary)).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}

function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="card mt-5 p-6">
        <p className="max-w-2xl text-lg">
          Zu dieser Werkstatt gibt es noch keinen Bericht. Warst du schon mal mit deinem Klassiker
          hier? Dann hilf den anderen mit deiner Erfahrung.
        </p>
      </div>
    );
  }
  return (
    <ul className="mt-5 flex flex-col gap-5">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}

function jsonLd(workshop: Workshop, summary: ReturnType<typeof summarize>) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: workshop.name,
    url: `${SITE.url}/werkstatt/${workshop.slug}`,
    ...(workshop.telefon ? { telephone: workshop.telefon } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: workshop.strasse,
      postalCode: workshop.plz,
      addressLocality: workshop.ort.replace(/\(.*\)/, "").trim(),
      addressCountry: "DE",
    },
    ...(summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average,
            reviewCount: summary.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}
