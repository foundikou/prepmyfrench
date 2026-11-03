-- Exams, questions, answer options, and student attempts.

CREATE TABLE IF NOT EXISTS exams (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title            TEXT        NOT NULL,
  skill            TEXT        NOT NULL CHECK (skill IN ('comprehension_orale', 'comprehension_ecrite', 'expression_ecrite', 'expression_orale')),
  duration_minutes INTEGER     NOT NULL CHECK (duration_minutes > 0),
  is_published     BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_id    BIGINT  NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  position   INTEGER NOT NULL CHECK (position > 0),
  prompt     TEXT    NOT NULL,
  media_url  TEXT,
  level      TEXT    CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  UNIQUE (exam_id, position)
);

CREATE TABLE IF NOT EXISTS options (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id BIGINT  NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  label       TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (question_id, label)
);

CREATE TABLE IF NOT EXISTS attempts (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  exam_id     BIGINT      NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  score       INTEGER,
  total       INTEGER
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  attempt_id  BIGINT NOT NULL REFERENCES attempts (id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  option_id   BIGINT REFERENCES options (id) ON DELETE SET NULL,
  PRIMARY KEY (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS questions_exam_idx ON questions (exam_id, position);

CREATE INDEX IF NOT EXISTS options_question_idx ON options (question_id);

CREATE INDEX IF NOT EXISTS attempts_user_idx ON attempts (user_id, started_at DESC);