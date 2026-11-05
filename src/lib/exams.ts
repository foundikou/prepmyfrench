import { getSql } from "@/lib/db";

type Row = Record<string, any>;

export async function dbQuery(text: string, params: unknown[] = []): Promise<Row[]> {
  return (await getSql().query(text, params)) as unknown as Row[];
}

export type ExamOption = { id: number; label: string; body: string };
export type ExamQuestion = {
  id: number;
  position: number;
  prompt: string;
  mediaUrl: string | null;
  level: string | null;
  options: ExamOption[];
};
export type Exam = {
  id: number;
  title: string;
  skill: string;
  durationMinutes: number;
  accessLevel: number;
  questions: ExamQuestion[];
};

// Never selects is_correct: the answer key stays on the server.
export async function getPublishedExam(examId: number): Promise<Exam | null> {
  const [exam] = await dbQuery(
    "SELECT id, title, skill, duration_minutes, access_level FROM exams WHERE id = $1 AND is_published = true",
    [examId]
  );
  if (!exam) return null;

  const questions = await dbQuery(
    "SELECT id, position, prompt, media_url, level FROM questions WHERE exam_id = $1 ORDER BY position",
    [examId]
  );
  const options = await dbQuery(
    `SELECT o.id, o.question_id, o.label, o.body
     FROM options o JOIN questions q ON q.id = o.question_id
     WHERE q.exam_id = $1
     ORDER BY o.question_id, o.label`,
    [examId]
  );

  return {
    id: Number(exam.id),
    title: exam.title,
    skill: exam.skill,
    durationMinutes: Number(exam.duration_minutes),
    accessLevel: Number(exam.access_level),
    questions: questions.map((q) => ({
      id: Number(q.id),
      position: Number(q.position),
      prompt: q.prompt,
      mediaUrl: q.media_url,
      level: q.level,
      options: options
        .filter((o) => Number(o.question_id) === Number(q.id))
        .map((o) => ({ id: Number(o.id), label: o.label, body: o.body })),
    })),
  };
}