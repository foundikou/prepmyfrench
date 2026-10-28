"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    if (isRegister) {
      const confirm = String(form.get("confirm") ?? "");
      if (confirm !== payload.password) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      payload.fullName = String(form.get("fullName") ?? "");
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      const next = params.get("next");
      const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap card">
      <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="sub">
        {isRegister ? "Start preparing for your TCF Canada exam." : "Log in to continue your preparation."}
      </p>

      {error && <div className="error" role="alert">{error}</div>}

      <form onSubmit={onSubmit} noValidate>
        {isRegister && (
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" type="text" autoComplete="name" required />
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
          {isRegister && <div className="hint">At least 8 characters, with a letter and a number.</div>}
        </div>

        {isRegister && (
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
          </div>
        )}

        <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="auth-alt">
        {isRegister ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>New here? <Link href="/register">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
