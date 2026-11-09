// Importe et insère les vraies questions de l'examen depuis un fichier JSON
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Check .env.local.");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log("Nettoyage des anciens examens de test...");
  await sql.query("TRUNCATE TABLE exams RESTART IDENTITY CASCADE;");

  // Chemin vers le fichier JSON contenant les 39 questions
  const jsonPath = path.join(process.cwd(), "scripts", "exam-data.json");
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`Fichier introuvable : ${jsonPath}. Veuillez y placer vos questions.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const examData = JSON.parse(rawData);

  // Insertion de l'examen
  const [{ id: examId }] = await sql.query(
    "INSERT INTO exams (title, skill, duration_minutes, is_published) VALUES ($1, $2, $3, true) RETURNING id",
    [examData.title, "comprehension_ecrite", examData.durationMinutes]
  );

  const labels = ["A", "B", "C", "D"];

  try {
    for (const q of examData.questions) {
      // Combine le texte du document et la question avec le séparateur "|||"
      const combinedPrompt = `${q.documentText}|||${q.questionText}`;

      const [{ id: questionId }] = await sql.query(
        "INSERT INTO questions (exam_id, position, prompt, level) VALUES ($1, $2, $3, $4) RETURNING id",
        [examId, q.position, combinedPrompt, q.level]
      );
      
      for (let j = 0; j < q.options.length; j++) {
        const isCorrect = j === q.correct;
        await sql.query(
          "INSERT INTO options (question_id, label, body, is_correct) VALUES ($1, $2, $3, $4)",
          [questionId, labels[j], q.options[j], isCorrect]
        );
      }
    }
    console.log(`✅ Examen #${examId} "${examData.title}" créé avec succès avec ses 39 vraies questions.`);
  } catch (err) {
    console.error(`Erreur lors du peuplement de l'examen : ${err.message}`);
  }
}

main().catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});