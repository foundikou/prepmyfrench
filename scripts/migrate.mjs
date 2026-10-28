// Applies schema.sql to the database in DATABASE_URL.
// Usage: npm run db:migrate   (reads .env.local)
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const sql = neon(url);
const raw = await readFile(new URL("../schema.sql", import.meta.url), "utf8");

// Remove comment lines first, then split into statements.
const schema = raw
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

const [{ now }] = await sql`SELECT now() AS now`;
console.log(`Migration applied (${statements.length} statements). Database time: ${now}`);