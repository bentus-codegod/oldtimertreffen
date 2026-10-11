"use client";

import { useState, useTransition } from "react";
import { submitReportAction } from "@/app/actions";

/** Kleiner „Melden“-Link unter einer Bewertung (Notice-and-Takedown). */
export default function MeldenButton({ reviewId }: { reviewId: string }) {
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) return <span className="text-sm text-muted">{done}</span>;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await submitReportAction(reviewId, "");
          setDone(res.message);
        })
      }
      className="text-sm text-muted underline-offset-4 transition-colors hover:text-warn hover:underline disabled:opacity-60"
    >
      {pending ? "…" : "Melden"}
    </button>
  );
}
