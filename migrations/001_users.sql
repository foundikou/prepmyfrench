-- PrepMyFrench database schema (PostgreSQL / Neon)
-- Run with `npm run db:migrate`, or paste into the Neon SQL Editor.

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails are stored lowercase by the app; this index enforces uniqueness.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);
