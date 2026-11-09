"use server";

import { getSql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { dbQuery } from "@/lib/exams";

const GRACE_SECONDS = 60;

type StartResult = { ok: true; attemptId: number } | { ok: false; error: string };
type SubmitResult = { ok: true; score: number; total: number } | { ok: false; error: string };

export type ReviewItem = {
  questionId: number;
  position: number;
  prompt: string;
  mediaUrl: string | null;
  level: string | null;
  points: number;
  options: { id: number; label: string; body: string; isCorrect: boolean }[];
  selectedOptionId: number | null;
};

export type ReviewResult = 
  | { ok: true; score: number; total: number; questions: ReviewItem[] }
  | { ok: false; error: string };

// Helper to determine points per TCF level and position
function getQuestionPoints(level: string | null, position: number): number {
  if (level) {
    switch (level.toUpperCase()) {
      case "A1": return 3;
      case "A2": return 9;
      case "B1": return 15;
      case "B2": return 21;
      case "C1": return 26;
      case "C2": return 33;
    }
  }
  // Fallback if level is missing
  if (position <= 4) return 3;
  if (position <= 10) return 9;
  if (position <= 19) return 15;
  if (position <= 29) return 21;
  if (position <= 35) return 26;
  return 33;
}

export async function startAttempt(examId: number): Promise<StartResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Veuillez vous reconnecter." };
  if (!Number.isInteger(examId)) return { ok: false, error: "Examen introuvable." };

  const exam = await dbQuery("SELECT id FROM exams WHERE id = $1 AND is_published = true", [examId]);
  if (exam.length === 0) return { ok: false, error: "Examen introuvable." };

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

  const maxAllowedSeconds = Number(attempt.duration_minutes) * 60 + GRACE_SECONDS;
  if (Number(attempt.elapsed) > maxAllowedSeconds) {
    return { ok: false, error: "Le temps imparti est écoulé." };
  }

  // Fetch questions for point calculation
  const questions = await dbQuery(
    "SELECT id, position, level FROM questions WHERE exam_id = $1",
    [attempt.exam_id]
  );
  
  const questionMap = new Map(
    questions.map((q) => [Number(q.id), {
      points: getQuestionPoints(q.level, Number(q.position))
    }])
  );

  const total = Array.from(questionMap.values()).reduce((sum, q) => sum + q.points, 0);

  const key = await dbQuery(
    `SELECT q.id AS question_id, o.id AS option_id, o.is_correct
     FROM questions q JOIN options o ON o.question_id = q.id
     WHERE q.exam_id = $1`,
    [attempt.exam_id]
  );

  const correct = new Set(key.filter((r) => r.is_correct).map((r) => Number(r.option_id)));
  const optionToQuestion = new Map(key.map((r) => [Number(r.option_id), Number(r.question_id)]));

  let score = 0;
  const valid: [number, number][] = [];

  for (const [qRaw, oRaw] of Object.entries(answers)) {
    const q = Number(qRaw);
    const o = Number(oRaw);
    if (optionToQuestion.get(o) !== q) continue; // ignore forged answers
    valid.push([q, o]);
    if (correct.has(o)) {
      score += questionMap.get(q)?.points ?? 1;
    }
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

export async function getAttemptReview(attemptId: number): Promise<ReviewResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Veuillez vous reconnecter." };

  const [attempt] = await dbQuery(
    `SELECT a.id, a.exam_id, a.score, a.total, a.finished_at, a.user_id 
     FROM attempts a WHERE a.id = $1 AND a.user_id = $2`,
    [attemptId, session.userId]
  );

  if (!attempt || !attempt.finished_at) {
    return { ok: false, error: "Tentative introuvable ou non terminée." };
  }

  const questions = await dbQuery(
    "SELECT id, position, prompt, media_url, level FROM questions WHERE exam_id = $1 ORDER BY position",
    [attempt.exam_id]
  );

  const options = await dbQuery(
    `SELECT o.id, o.question_id, o.label, o.body, o.is_correct 
     FROM options o JOIN questions q ON q.id = o.question_id 
     WHERE q.exam_id = $1 
     ORDER BY o.question_id, o.label`,
    [attempt.exam_id]
  );

  const userAnswers = await dbQuery(
    "SELECT question_id, option_id FROM attempt_answers WHERE attempt_id = $1",
    [attemptId]
  );
  const answerMap = new Map(userAnswers.map((r) => [Number(r.question_id), Number(r.option_id)]));

  const reviewQuestions: ReviewItem[] = questions.map((q) => {
    const qId = Number(q.id);
    const position = Number(q.position);
    const level = q.level;
    const points = getQuestionPoints(level, position);

    const qOptions = options
      .filter((o) => Number(o.question_id) === qId)
      .map((o) => ({
        id: Number(o.id),
        label: o.label,
        body: o.body,
        isCorrect: Boolean(o.is_correct),
      }));

    return {
      questionId: qId,
      position,
      prompt: q.prompt,
      mediaUrl: q.media_url,
      level,
      points,
      options: qOptions,
      selectedOptionId: answerMap.get(qId) ?? null,
    };
  });

  return {
    ok: true,
    score: Number(attempt.score),
    total: Number(attempt.total),
    questions: reviewQuestions,
  };
}