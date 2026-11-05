import { TrendingUp } from "lucide-react";
import { getProgress } from "@/lib/progress";
import { getEntitlements } from "@/lib/access";
import { Badge } from "@/components/ui/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export async function ProgressCard({ userId, role }: { userId: string; role?: string }) {
  const [progress, ent] = await Promise.all([getProgress(userId), getEntitlements(userId, role)]);
  const limit = ent.limits.attempt;
  const n = progress.attemptsCount;

  return (
    <section className="card mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-brand/10 p-3 text-brand">
            <TrendingUp className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Ma progression</h2>
            <p className="mt-1 text-muted">
              {n === 0
                ? "Aucun examen passé pour le moment. Choisissez une épreuve ci-dessous pour commencer."
                : `${n} examen${n > 1 ? "s" : ""} terminé${n > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="text-sm sm:text-right">
          <Badge>Plan {ent.planName}</Badge>
          <p className="mt-1 text-muted">
            Tentatives ce mois-ci&nbsp;: {ent.used.attempt}
            {limit === null ? " (illimitées)" : ` / ${limit}`}
          </p>
        </div>
      </div>

      {n > 0 && (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-2xl font-black">{n}</p>
              <p className="text-xs text-muted">Examens</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-2xl font-black">{progress.averagePercent ?? 0}&nbsp;%</p>
              <p className="text-xs text-muted">Moyenne</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-2xl font-black">{progress.bestPercent ?? 0}&nbsp;%</p>
              <p className="text-xs text-muted">Meilleur score</p>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-muted">Derniers examens</h3>
          <ul className="mt-2 divide-y divide-line">
            {progress.recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span>
                  {r.title}
                  <span className="block text-xs text-muted">{formatDate(r.finishedAt)}</span>
                </span>
                <strong>
                  {r.score} / {r.total}
                </strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}