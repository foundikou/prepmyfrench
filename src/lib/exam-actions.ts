"use server";

import { getSql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { dbQuery } from "@/lib/exams";
import { canOpenExam, consumeUsage, getEntitlements, lockedMessage } from "@/lib/access";

const GRACE_SECONDS = 60;

type StartResult = { ok: true; attemptId: number } | { ok: false; error: string };
type SubmitResult = { ok: true; score: number; total: number } | { ok: false; error: string };

export async function startAttempt(examId: number): Promise<StartResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Veuillez vous reconnecter." };
  if (!Number.isInteger(examId)) return { ok: false, error: "Examen introuvable." };

  const [exam] = await dbQuery(
    "SELECT id, access_level FROM exams WHERE id = $1 AND is_published = true",
    [examId]
  );
  if (!exam) return { ok: false, error: "Examen introuvable." };

  const ent = await getEntitlements(session.userId, session.role);
  if (!canOpenExam(ent, Number(exam.access_level))) {
    return { ok: false, error: lockedMessage(Number(exam.access_level)) };
  }

  const allowed = await consumeUsage(session.userId, "attempt", ent.limits.attempt);
  if (!allowed) {
    return {
      ok: false,
      error: `Vous avez atteint la limite de ${ent.limits.attempt} tentatives ce mois-ci avec le plan ${ent.planName}.`,
    };
  }

  const [row] = await dbQuery(
    "INSERT INTO attempts (user_id, exam_id) VALUES ($1, $2) RETURNING id",
    [session.userId, examId]
  );
  return { ok: true, attemptId: Number(row.id) };
}

export async function submitAttempt(
  attemptId: number,
  answers: Record<string, number>
): Promise<SubmitResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Veuillez vous reconnecter." };

  const [attempt] = await dbQuery(
    `SELECT a.id, a.exam_id, a.finished_at, e.duration_minutes,
            EXTRACT(EPOCH FROM (now() - a.started_at)) AS elapsed
     FROM attempts a JOIN exams e ON e.id = a.exam_id
     WHERE a.id = $1 AND a.user_id = $2`,
    [attemptId, session.userId]
  );
  if (!attempt) return { ok: false, error: "Tentative introuvable." };
  if (attempt.finished_at) return { ok: false, error: "Cette tentative est déjà terminée." };
  if (Number(attempt.elapsed) > Number(attempt.duration_minutes) * 60 + GRACE_SECONDS) {
    return { ok: false, error: "Le temps imparti est écoulé." };
  }

  const key = await dbQuery(
    `SELECT q.id AS question_id, o.id AS option_id, o.is_correct
     FROM questions q JOIN options o ON o.question_id = q.id
     WHERE q.exam_id = $1`,
    [attempt.exam_id]
  );

  const total = new Set(key.map((r) => Number(r.question_id))).size;
  const correct = new Set(key.filter((r) => r.is_correct).map((r) => Number(r.option_id)));
  const optionToQuestion = new Map(key.map((r) => [Number(r.option_id), Number(r.question_id)]));

  let score = 0;
  const valid: [number, number][] = [];
  for (const [qRaw, oRaw] of Object.entries(answers)) {
    const q = Number(qRaw);
    const o = Number(oRaw);
    if (optionToQuestion.get(o) !== q) continue; // ignore forged answers
    valid.push([q, o]);
    if (correct.has(o)) score++;
  }

  try {
    const sql = getSql();
    await sql.transaction([
      ...valid.map(([q, o]) =>
        sql.query(
          "INSERT INTO attempt_answers (attempt_id, question_id, option_id) VALUES ($1, $2, $3)",
          [attemptId, q, o]
        )
      ),
      sql.query(
        "UPDATE attempts SET finished_at = now(), score = $2, total = $3 WHERE id = $1 AND finished_at IS NULL",
        [attemptId, score, total]
      ),
    ]);
  } catch {
    return { ok: false, error: "Impossible d'enregistrer vos réponses. Réessayez." };
  }

  return { ok: true, score, total };
}