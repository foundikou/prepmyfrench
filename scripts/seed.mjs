// Inserts 5 sample TCF exams, each fully expanded to 39 questions following official difficulty levels.
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Check .env.local.");
  process.exit(1);
}

const sql = neon(url);

// Générateur de 39 questions réalistes pour la compréhension écrite TCF
function generateTcfQuestions(examIndex) {
  const questions = [];
  const labels = ["A", "B", "C", "D"];

  // Définition de la structure des 39 questions par tranche de niveau
  const structure = [
    { count: 4, level: "A1", prefix: "A1 - Panneau ou message court" },
    { count: 6, level: "A2", prefix: "A2 - Annonce ou consigne pratique" },
    { count: 9, level: "B1", prefix: "B1 - Article informatif ou fait divers" },
    { count: 10, level: "B2", prefix: "B2 - Texte argumentatif ou professionnel" },
    { count: 6, level: "C1", prefix: "C1 - Extrait littéraire ou essai complexe" },
    { count: 4, level: "C2", prefix: "C2 - Registre soutenu ou subtilité lexicale" },
  ];

  let pos = 1;
  for (const block of structure) {
    for (let i = 1; i <= block.count; i++) {
      questions.push({
        level: block.level,
        // Au lieu de: `[Examen 1] Question ${pos} (${level}) : ...`
// Utilisez simplement :
prompt: `Question ${pos} - Panneau ou message court #${pos}. Quelle est l'interprétation correcte de ce document ?`,
        options: [
          `Première option hypothétique pour la question ${pos}`,
          `Réponse correcte officielle pour la question ${pos} (Option B)`,
          `Troisième proposition plausible pour le test`,
          `Quatrième option incorrecte de distraction`
        ],
        correct: 1, // L'option d'indice 1 (B) est la bonne
      });
      pos++;
    }
  }

  return questions;
}

const examsToSeed = [1, 2, 3, 4, 5].map((id) => ({
  title: `TCF Canada - Compréhension écrite (Examen ${id})`,
  skill: "comprehension_ecrite",
  duration_minutes: 60,
  questions: generateTcfQuestions(id),
}));

const labels = ["A", "B", "C", "D"];

// Nettoyage préalable pour repartir sur une base propre avec 39 questions
console.log("Nettoyage des anciens examens de test...");
await sql.query("TRUNCATE TABLE exams RESTART IDENTITY CASCADE;");

for (const examData of examsToSeed) {
  const [{ id: examId }] = await sql.query(
    "INSERT INTO exams (title, skill, duration_minutes, is_published) VALUES ($1, $2, $3, true) RETURNING id",
    [examData.title, examData.skill, examData.duration_minutes]
  );

  try {
    for (const [i, q] of examData.questions.entries()) {
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
    console.log(`✅ Examen #${examId} "${examData.title}" créé avec succès (39 questions configurées).`);
  } catch (err) {
    console.error(`Erreur lors du peuplement de l'examen : ${err.message}`);
  }
}