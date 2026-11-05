import { dbQuery } from "@/lib/exams";

export const SECTIONS = {
  "comprehension-orale": {
    skill: "comprehension_orale",
    titre: "Compréhension orale",
    description: "Questions à choix multiples chronométrées à partir d'enregistrements audio.",
  },
  "comprehension-ecrite": {
    skill: "comprehension_ecrite",
    titre: "Compréhension écrite",
    description: "Textes variés et questions à choix multiples, en temps limité.",
  },
  "expression-ecrite": {
    skill: "expression_ecrite",
    titre: "Expression écrite",
    description: "Rédigez vos réponses et recevez une correction détaillée.",
  },
  "expression-orale": {
    skill: "expression_orale",
    titre: "Expression orale",
    description: "Enregistrez vos réponses et obtenez des retours personnalisés.",
  },
} as const;

export function getSection(slug: string) {
  return (SECTIONS as Record<string, (typeof SECTIONS)[keyof typeof SECTIONS]>)[slug] ?? null;
}

export const LEVEL_LABELS = ["Gratuit", "Standard", "Premium"];

export type ExamListItem = {
  id: number;
  title: string;
  durationMinutes: number;
  accessLevel: number;
  questionCount: number;
  attemptsDone: number;
  bestScore: number | null;
};

export async function listExamsBySkill(skill: string, userId: string): Promise<ExamListItem[]> {
  const rows = await dbQuery(
    `SELECT e.id, e.title, e.duration_minutes, e.access_level,
            (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS question_count,
            (SELECT COUNT(*) FROM attempts a
               WHERE a.exam_id = e.id AND a.user_id = $2 AND a.finished_at IS NOT NULL) AS attempts_done,
            (SELECT MAX(a.score) FROM attempts a
               WHERE a.exam_id = e.id AND a.user_id = $2 AND a.finished_at IS NOT NULL) AS best_score
     FROM exams e
     WHERE e.skill = $1 AND e.is_published = true
     ORDER BY e.access_level, e.id`,
    [skill, userId]
  );
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    durationMinutes: Number(r.duration_minutes),
    accessLevel: Number(r.access_level),
    questionCount: Number(r.question_count),
    attemptsDone: Number(r.attempts_done),
    bestScore: r.best_score === null ? null : Number(r.best_score),
  }));
}