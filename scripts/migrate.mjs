// Applies every file in /migrations (in name order) that hasn't run yet.
// Usage: npm run db:migrate   (reads .env.local)
import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const sql = neon(url);
const dir = new URL("../migrations/", import.meta.url);

// Tracking table: remembers which migration files were already applied.
await sql.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const applied = new Set(
  (await sql.query("SELECT name FROM schema_migrations")).map((r) => r.name)
);

const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

let count = 0;
for (const file of files) {
  if (applied.has(file)) continue;

  const raw = await readFile(new URL(file, dir), "utf8");

  // Remove comment lines first, then split into statements.
  const statements = raw
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    // One transaction per file: all statements succeed or none are applied.
    await sql.transaction([
      ...statements.map((s) => sql.query(s)),
      sql.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]),
    ]);
    console.log(`applied ${file} (${statements.length} statements)`);
    count++;
  } catch (err) {
    console.error(`FAILED ${file}: ${err.message}`);
    process.exit(1);
  }
}

console.log(count === 0 ? "Nothing to apply, database is up to date." : `Done, ${count} migration(s) applied.`);