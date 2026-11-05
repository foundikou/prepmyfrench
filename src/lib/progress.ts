import { dbQuery } from "@/lib/exams";

export type RecentAttempt = {
  id: number;
  title: string;
  score: number;
  total: number;
  finishedAt: string;
};

export type Progress = {
  attemptsCount: number;
  averagePercent: number | null;
  bestPercent: number | null;
  recent: RecentAttempt[];
};

export async function getProgress(userId: string): Promise<Progress> {
  const [stats] = await dbQuery(
    `SELECT COUNT(*) AS n,
            AVG(100.0 * score / NULLIF(total, 0)) AS avg_pct,
            MAX(100.0 * score / NULLIF(total, 0)) AS best_pct
     FROM attempts
     WHERE user_id = $1 AND finished_at IS NOT NULL`,
    [userId]
  );
  const recent = await dbQuery(
    `SELECT a.id, e.title, a.score, a.total, a.finished_at
     FROM attempts a JOIN exams e ON e.id = a.exam_id
     WHERE a.user_id = $1 AND a.finished_at IS NOT NULL
     ORDER BY a.finished_at DESC
     LIMIT 5`,
    [userId]
  );

  return {
    attemptsCount: Number(stats.n),
    averagePercent: stats.avg_pct === null ? null : Math.round(Number(stats.avg_pct)),
    bestPercent: stats.best_pct === null ? null : Math.round(Number(stats.best_pct)),
    recent: recent.map((r) => ({
      id: Number(r.id),
      title: r.title,
      score: Number(r.score),
      total: Number(r.total),
      finishedAt: new Date(r.finished_at).toISOString(),
    })),
  };
}