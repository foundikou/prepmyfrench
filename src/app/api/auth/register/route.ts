import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSql, type DbUser } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { fullName, email, password } = parsed.data;
  const sql = getSql();

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const rows = (await sql`
      INSERT INTO users (full_name, email, password_hash)
      VALUES (${fullName}, ${email}, ${passwordHash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, full_name, email, role
    `) as Pick<DbUser, "id" | "full_name" | "email" | "role">[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = rows[0];
    await createSessionCookie({
      userId: String(user.id),
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
