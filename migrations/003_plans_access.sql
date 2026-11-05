-- Plans, subscriptions, monthly usage, exam access level, reading passages.
-- A NULL limit means unlimited. The plan limits below are placeholders until decision D1 is made.

CREATE TABLE IF NOT EXISTS plans (
  id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code                     TEXT    NOT NULL UNIQUE,
  name                     TEXT    NOT NULL,
  level                    INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  attempts_per_month       INTEGER,
  ai_writing_per_month     INTEGER NOT NULL DEFAULT 0,
  ai_oral_per_month        INTEGER NOT NULL DEFAULT 0,
  tutor_requests_per_month INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (code, name, level, attempts_per_month, ai_writing_per_month, ai_oral_per_month, tutor_requests_per_month)
VALUES
  ('free', 'Gratuit', 0, 5, 1, 0, 0),
  ('standard', 'Standard', 1, NULL, 10, 3, 0),
  ('premium', 'Premium', 2, NULL, 30, 10, 3)
ON CONFLICT (code) DO NOTHING;

-- A user with no active subscription is treated as Gratuit by the app.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id            BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan_id            BIGINT NOT NULL REFERENCES plans (id),
  status             TEXT   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_end TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user ON subscriptions (user_id) WHERE status = 'active';

-- One counter per user, feature and month. The period is the first day of the month.
CREATE TABLE IF NOT EXISTS usage (
  user_id BIGINT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  feature TEXT    NOT NULL CHECK (feature IN ('attempt', 'ai_writing', 'ai_oral', 'tutor_request')),
  period  DATE    NOT NULL,
  used    INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0),
  PRIMARY KEY (user_id, feature, period)
);

-- Reading texts shared by one or more questions.
CREATE TABLE IF NOT EXISTS passages (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_id  BIGINT  NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  title    TEXT,
  body     TEXT    NOT NULL,
  UNIQUE (exam_id, position)
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_id BIGINT REFERENCES passages (id) ON DELETE SET NULL;

-- Minimum plan level needed to open an exam: 0 free, 1 standard, 2 premium.
ALTER TABLE exams ADD COLUMN IF NOT EXISTS access_level INTEGER NOT NULL DEFAULT 0 CHECK (access_level BETWEEN 0 AND 2);

CREATE INDEX IF NOT EXISTS questions_passage_idx ON questions (passage_id);