import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canOpenExam, getEntitlements, lockedMessage } from "@/lib/access";
import { LEVEL_LABELS, getSection, listExamsBySkill } from "@/lib/sections";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Épreuves | PrepMyFrench" };

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();

  const [exams, ent] = await Promise.all([
    listExamsBySkill(section.skill, session.userId),
    getEntitlements(session.userId, session.role),
  ]);

  return (
    <div className="pt-8">
      <ButtonLink href="/dashboard" variant="ghost">
        ← Tableau de bord
      </ButtonLink>

      <h1 className="mt-6 text-3xl font-black">{section.titre}</h1>
      <p className="mt-2 text-muted">{section.description}</p>
      <p className="mt-1 text-sm text-muted">Votre plan : {ent.planName}</p>

      {exams.length === 0 ? (
        <Card className="mt-6">
          <p className="text-muted">Aucun examen disponible pour le moment. Revenez bientôt&nbsp;!</p>
        </Card>
      ) : (
        <ul className="mt-6 grid gap-4">
          {exams.map((e) => {
            const open = canOpenExam(ent, e.accessLevel);
            return (
              <li key={e.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">{e.title}</h2>
                      {e.accessLevel > 0 && <Badge>{LEVEL_LABELS[e.accessLevel]}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {e.questionCount} questions · {e.durationMinutes} minutes
                    </p>
                    {e.attemptsDone > 0 && (
                      <p className="mt-1 text-sm text-muted">
                        Meilleur score&nbsp;: {e.bestScore} / {e.questionCount} · {e.attemptsDone} tentative
                        {e.attemptsDone > 1 ? "s" : ""}
                      </p>
                    )}
                    {!open && <p className="mt-1 text-sm text-muted">{lockedMessage(e.accessLevel)}</p>}
                  </div>
                  {open ? (
                    <ButtonLink href={`/exams/${e.id}`}>{e.attemptsDone > 0 ? "Refaire" : "Commencer"}</ButtonLink>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      Verrouillé
                    </span>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}