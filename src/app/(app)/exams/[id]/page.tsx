import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPublishedExam } from "@/lib/exams";
import { canOpenExam, getEntitlements, lockedMessage } from "@/lib/access";
import { ExamRunner } from "@/components/ExamRunner";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Examen | PrepMyFrench" };

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const examId = Number(id);
  if (!Number.isInteger(examId) || examId <= 0) notFound();

  const exam = await getPublishedExam(examId);
  if (!exam) notFound();

  const ent = await getEntitlements(session.userId, session.role);
  if (!canOpenExam(ent, exam.accessLevel)) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <Card className="text-center">
          <h1 className="text-2xl font-black">Examen réservé</h1>
          <p className="mt-3 text-muted">{lockedMessage(exam.accessLevel)}</p>
          <p className="mt-1 text-sm text-muted">Votre plan actuel : {ent.planName}.</p>
          <ButtonLink href="/dashboard" className="mt-6">
            Retour au tableau de bord
          </ButtonLink>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-8">
      <ExamRunner exam={exam} />
    </div>
  );
}