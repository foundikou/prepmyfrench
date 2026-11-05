"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { startAttempt, submitAttempt } from "@/lib/exam-actions";
import type { Exam } from "@/lib/exams";

type Phase = "intro" | "running" | "done";

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamRunner({ exam }: { exam: Exam }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMinutes * 60);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const endsAt = useRef(0);
  const submitting = useRef(false);
  const expired = useRef(false);

  const total = exam.questions.length;
  const answered = Object.keys(answers).length;

  async function start() {
    setBusy(true);
    setError(null);
    const res = await startAttempt(exam.id);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    endsAt.current = Date.now() + exam.durationMinutes * 60 * 1000;
    setAttemptId(res.attemptId);
    setSecondsLeft(exam.durationMinutes * 60);
    setPhase("running");
  }

  const finish = useCallback(async () => {
    if (submitting.current || attemptId === null) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    const res = await submitAttempt(attemptId, answers);
    setBusy(false);
    if (!res.ok) {
      submitting.current = false;
      setError(res.error);
      return;
    }
    setResult({ score: res.score, total: res.total });
    setPhase("done");
  }, [attemptId, answers]);

  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0 && !expired.current) {
        expired.current = true;
        void finish();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, finish]);

  if (phase === "intro") {
    return (
      <Card>
        <h1 className="text-2xl font-black">{exam.title}</h1>
        <p className="mt-2 text-muted">
          {total} questions · {exam.durationMinutes} minutes
        </p>
        <p className="mt-4 text-sm text-muted">
          Le chronomètre démarre dès que vous cliquez sur « Commencer ». Vous pouvez revenir sur vos
          réponses avant de terminer. À la fin du temps, vos réponses sont envoyées automatiquement.
        </p>
        {error && <p className="error mt-4">{error}</p>}
        <Button className="mt-6" onClick={start} disabled={busy}>
          {busy ? "Chargement…" : "Commencer"}
        </Button>
      </Card>
    );
  }

  if (phase === "done" && result) {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <Card className="text-center">
        <h1 className="text-2xl font-black">Examen terminé</h1>
        <p className="mt-6 text-5xl font-black text-brand">
          {result.score} / {result.total}
        </p>
        <p className="mt-2 text-muted">{percent}&nbsp;% de bonnes réponses</p>
        <ButtonLink href="/dashboard" className="mt-8">
          Retour au tableau de bord
        </ButtonLink>
      </Card>
    );
  }

  const q = exam.questions[index];
  const isLast = index === total - 1;

  return (
    <Card>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          Question {index + 1} sur {total}
        </span>
        <span
          role="timer"
          className={`font-mono text-base font-bold ${secondsLeft <= 60 ? "text-danger" : "text-ink"}`}
        >
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <h2 className="mt-6 text-lg font-bold">{q.prompt}</h2>

      <fieldset className="mt-5 grid gap-3">
        <legend className="sr-only">Réponses possibles</legend>
        {q.options.map((o) => {
          const selected = answers[q.id] === o.id;
          return (
            <label
              key={o.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                selected ? "border-brand bg-brand/5" : "border-line bg-white hover:border-brand/50"
              }`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                className="h-4 w-4"
                checked={selected}
                onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
              />
              <span>
                <strong className="mr-2">{o.label}.</strong>
                {o.body}
              </span>
            </label>
          );
        })}
      </fieldset>

      {error && <p className="error mt-4">{error}</p>}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setIndex((i) => i - 1)} disabled={index === 0 || busy}>
          Précédent
        </Button>
        {isLast ? (
          <Button onClick={finish} disabled={busy}>
            {busy ? "Envoi…" : "Terminer l'examen"}
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)}>Suivant</Button>
        )}
      </div>

      {isLast && answered < total && (
        <p className="hint mt-3 text-right">
          Il vous reste {total - answered} question{total - answered > 1 ? "s" : ""} sans réponse.
        </p>
      )}
    </Card>
  );
}