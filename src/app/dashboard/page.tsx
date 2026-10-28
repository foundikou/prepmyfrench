import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata = { title: "Dashboard | PrepMyFrench" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const firstName = session.fullName.split(" ")[0];

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <span className="badge">{session.role}</span>
        <h1 style={{ marginTop: 12 }}>Bonjour, {firstName}!</h1>
        <p>You are signed in as {session.email}.</p>
      </section>

      <section className="grid">
        <div className="card tile">
          <h3>Practice exams</h3>
          <p>Coming soon: timed MCQ sections for listening, reading and structure.</p>
        </div>
        <div className="card tile">
          <h3>Writing &amp; speaking</h3>
          <p>Coming soon: submit answers for tutor correction.</p>
        </div>
        <div className="card tile">
          <h3>My progress</h3>
          <p>Coming soon: score history and weak-skill insights.</p>
        </div>
      </section>
    </>
  );
}
