import { Suspense } from "react";
import WorkshopExplorer from "@/components/WorkshopExplorer";
import { loadWorkshops } from "@/lib/workshops";

async function WorkshopData() {
  const { workshops, source } = await loadWorkshops();
  return <WorkshopExplorer initialWorkshops={workshops} source={source} />;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <WorkshopData />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="h-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-12 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
