// Inserts one sample exam (5 French questions) for local development.
// Usage: npm run db:seed   (reads .env.local). Safe to run twice.
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Check .env.local.");
  process.exit(1);
}

const sql = neon(url);

const exam = {
  title: "TCF Canada - Compréhension écrite (exemple)",
  skill: "comprehension_ecrite",
  duration_minutes: 10,
  questions: [
    {
      level: "A1",
      prompt: "Je m'appelle Maahir. J'habite à Douala depuis deux ans. Où habite Maahir ?",
      options: ["À Paris", "À Montréal", "À Douala", "À Québec"],
      correct: 2,
    },
    {
      level: "A2",
      prompt: "Le magasin ouvre à 9 h et ferme à 18 h. À quelle heure ferme le magasin ?",
      options: ["17 h", "18 h", "19 h", "20 h"],
      correct: 1,
    },
    {
      level: "B1",
      prompt: "Complétez : Hier, nous ___ au cinéma.",
      options: ["allez", "irons", "sommes allés", "allons"],
      correct: 2,
    },
    {
      level: "B1",
      prompt: "Que signifie l'expression « Il pleut à verse » ?",
      options: ["Il pleut très fort", "Il pleut un peu", "Il ne pleut pas", "Il pleut seulement le soir"],
      correct: 0,
    },
    {
      level: "B2",
      prompt: "Complétez : Si j'avais plus de temps, je ___ davantage.",
      options: ["lirais", "lis", "lirai", "ai lu"],
      correct: 0,
    },
  ],
};

const existing = await sql.query("SELECT id FROM exams WHERE title = $1", [exam.title]);
if (existing.length > 0) {
  console.log("Sample exam already exists, nothing to do.");
  process.exit(0);
}

const [{ id: examId }] = await sql.query(
  "INSERT INTO exams (title, skill, duration_minutes, is_published) VALUES ($1, $2, $3, true) RETURNING id",
  [exam.title, exam.skill, exam.duration_minutes]
);

try {
  const labels = ["A", "B", "C", "D"];
  for (const [i, q] of exam.questions.entries()) {
    const [{ id: questionId }] = await sql.query(
      "INSERT INTO questions (exam_id, position, prompt, level) VALUES ($1, $2, $3, $4) RETURNING id",
      [examId, i + 1, q.prompt, q.level]
    );
    for (const [j, body] of q.options.entries()) {
      await sql.query(
        "INSERT INTO options (question_id, label, body, is_correct) VALUES ($1, $2, $3, $4)",
        [questionId, labels[j], body, j === q.correct]
      );
    }
  }
  console.log(`Seeded exam #${examId} with ${exam.questions.length} questions.`);
} catch (err) {
  // Remove the half-inserted exam (questions and options go with it).
  await sql.query("DELETE FROM exams WHERE id = $1", [examId]);
  console.error(`Seed failed, rolled back: ${err.message}`);
  process.exit(1);
}