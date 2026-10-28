import { neon } from "@neondatabase/serverless";

// Lazily create the client so `next build` works without a database.
let client: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
    }
    client = neon(url);
  }
  return client;
}

export type DbUser = {
  id: number | string;
  full_name: string;
  email: string;
  password_hash: string;
  role: "student" | "tutor" | "admin";
  created_at: string;
};
