# PrepMyFrench

TCF Canada exam-preparation platform. This starter includes working **registration, login, logout and a protected dashboard**, backed by **Neon PostgreSQL**.

**Stack:** Next.js 15 (App Router, TypeScript), Neon Postgres (`@neondatabase/serverless`), bcrypt password hashing, signed JWT session in an httpOnly cookie, Zod validation.

## Project structure

```
prepmyfrench/
  schema.sql                     users table
  scripts/migrate.mjs            applies schema.sql to Neon
  .env.example                   DATABASE_URL and AUTH_SECRET
  src/
    middleware.ts                protects /dashboard, redirects signed-in users from /login and /register
    lib/db.ts                    Neon client
    lib/session.ts               create, verify and clear the session cookie
    lib/validation.ts            Zod schemas for register and login
    app/api/auth/register|login|logout|me/route.ts
    app/register, app/login, app/dashboard, app/page.tsx
    components/AuthForm.tsx, LogoutButton.tsx
```

## Connect to Neon PostgreSQL: step by step

1. **Open your Neon project.** Sign in at https://console.neon.tech and open the `prepmyfrench` project (create it if it does not exist yet). Use the default branch (`main`) and database (`neondb`).
2. **Copy the connection string.** On the project dashboard click **Connect**. Choose your branch, database and role. Turn **Connection pooling** on and copy the string. It looks like:
   `postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require`
3. **Install the project.**
   ```bash
   cd prepmyfrench
   npm install
   ```
4. **Create your environment file.**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and paste the connection string as `DATABASE_URL`. Generate a session secret and paste it as `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
   (On Windows without openssl, run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.)
5. **Create the tables.**
   ```bash
   npm run db:migrate
   ```
   You should see `Migration applied`. Alternative: open the Neon **SQL Editor**, paste the contents of `schema.sql` and click **Run**.
6. **Start the app.**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, click **Sign up**, create an account, then log out and log back in.
7. **Check the data in Neon.** In the console open **Tables** (or run `SELECT id, full_name, email, role, created_at FROM users;` in the SQL Editor). Your new user appears there with a bcrypt `password_hash`, never the plain password.

## Deploy to Vercel

1. Push the project to GitHub (`.env.local` is git-ignored).
2. Import the repo in Vercel.
3. In **Settings > Environment Variables** add `DATABASE_URL` and `AUTH_SECRET` (use a different `AUTH_SECRET` from local if you like).
4. Deploy. Run `npm run db:migrate` once from your machine against the same Neon database (already done if you use one database for both).

Tip: Neon branches let you keep a separate `dev` branch database. Create a branch in the Neon console, copy its connection string into `.env.local`, and keep `main` for production.

## How authentication works

- **Register** (`POST /api/auth/register`): validates input, lowercases the email, hashes the password with bcrypt (cost 12), inserts the user (a unique index prevents duplicate emails), then sets the session cookie.
- **Login** (`POST /api/auth/login`): looks the user up by email, compares the bcrypt hash, returns the same generic error for unknown email or wrong password, then sets the session cookie.
- **Session:** a JWT signed with `AUTH_SECRET`, stored in an httpOnly, SameSite=Lax cookie (Secure in production), valid for 7 days.
- **Logout** (`POST /api/auth/logout`) clears the cookie. **Me** (`GET /api/auth/me`) returns the current session.
- **Middleware** guards `/dashboard`; the dashboard page also checks the session on the server.

## Troubleshooting

- `DATABASE_URL is not set`: `.env.local` is missing or in the wrong folder (it must be at the project root). Restart `npm run dev` after editing it.
- `password authentication failed`: re-copy the connection string from Neon, or reset the role password in the console.
- `AUTH_SECRET is missing or too short`: set a value of at least 16 characters.
- `relation "users" does not exist`: run `npm run db:migrate`.

## Before going to production

Add rate limiting on `/api/auth/login` and `/api/auth/register` (for example Upstash Ratelimit), email verification, and a password-reset flow. These are not included in this starter.

## Next steps for the platform

Add tables for exams, questions, attempts, writing submissions and subscriptions, each with a `user_id` referencing `users(id)`.
