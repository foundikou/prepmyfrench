import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSql, type DbUser } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

// A valid bcrypt hash used to keep response time similar when the email is unknown.
const DUMMY_HASH = "$2b$12$Wszy9uIrjvSXG5hZmokqGu8a6wLaNyvgdn6QUx1ljb4YeYHV8EKVu";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const sql = getSql();

  try {
    const rows = (await sql`
      SELECT id, full_name, email, password_hash, role
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `) as DbUser[];

    const user = rows[0];
    const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !ok) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createSessionCookie({
      userId: String(user.id),
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
