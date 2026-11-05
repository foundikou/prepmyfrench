import { dbQuery } from "@/lib/exams";

export type Feature = "attempt" | "ai_writing" | "ai_oral" | "tutor_request";

export type Entitlements = {
  planCode: string;
  planName: string;
  level: number;
  limits: Record<Feature, number | null>; // null = unlimited
  used: Record<Feature, number>;
};

const PLAN_NAMES = ["Gratuit", "Standard", "Premium"];

export function lockedMessage(accessLevel: number) {
  return `Cet examen est réservé au plan ${PLAN_NAMES[accessLevel] ?? "supérieur"} ou à un plan supérieur.`;
}

// What this user may do right now: plan level, monthly limits, and usage so far this month.
export async function getEntitlements(userId: string, role?: string): Promise<Entitlements> {
  const [plan] = await dbQuery(
    `SELECT code, name, level, attempts_per_month, ai_writing_per_month, ai_oral_per_month, tutor_requests_per_month
     FROM plans
     WHERE id = COALESCE(
       (SELECT s.plan_id FROM subscriptions s
        WHERE s.user_id = $1 AND s.status = 'active'
          AND (s.current_period_end IS NULL OR s.current_period_end > now())
        LIMIT 1),
       (SELECT id FROM plans WHERE code = 'free'))`,
    [userId]
  );
  if (!plan) throw new Error("Plans are not set up. Run npm run db:migrate.");

  const rows = await dbQuery(
    "SELECT feature, used FROM usage WHERE user_id = $1 AND period = date_trunc('month', now())::date",
    [userId]
  );
  const used: Record<Feature, number> = { attempt: 0, ai_writing: 0, ai_oral: 0, tutor_request: 0 };
  for (const r of rows) used[r.feature as Feature] = Number(r.used);

  // Admins are never blocked.
  if (role === "admin") {
    return {
      planCode: "admin",
      planName: "Administrateur",
      level: 2,
      limits: { attempt: null, ai_writing: null, ai_oral: null, tutor_request: null },
      used,
    };
  }

  return {
    planCode: plan.code,
    planName: plan.name,
    level: Number(plan.level),
    limits: {
      attempt: plan.attempts_per_month === null ? null : Number(plan.attempts_per_month),
      ai_writing: Number(plan.ai_writing_per_month),
      ai_oral: Number(plan.ai_oral_per_month),
      tutor_request: Number(plan.tutor_requests_per_month),
    },
    used,
  };
}

export function canOpenExam(ent: Entitlements, accessLevel: number) {
  return ent.level >= accessLevel;
}

// Counts one use of a feature this month. Returns false (and counts nothing) when the limit is reached.
// One single SQL statement, so two quick clicks cannot both slip under the limit.
export async function consumeUsage(userId: string, feature: Feature, limit: number | null): Promise<boolean> {
  if (limit !== null && limit <= 0) return false;
  const rows = await dbQuery(
    `INSERT INTO usage AS u (user_id, feature, period, used)
     VALUES ($1, $2, date_trunc('month', now())::date, 1)
     ON CONFLICT (user_id, feature, period)
     DO UPDATE SET used = u.used + 1
     WHERE $3::int IS NULL OR u.used < $3::int
     RETURNING u.used`,
    [userId, feature, limit]
  );
  return rows.length > 0;
}