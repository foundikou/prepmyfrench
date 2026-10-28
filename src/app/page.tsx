import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <>
      <section className="hero">
        <h1>Prepare for the TCF Canada with confidence.</h1>
        <p>
          Timed practice exams, writing and speaking feedback, and a clear view of your progress,
          all in one place.
        </p>
        {session ? (
          <Link href="/dashboard" className="btn">
            Go to your dashboard
          </Link>
        ) : (
          <Link href="/register" className="btn">
            Create your free account
          </Link>
        )}
      </section>

      <section className="grid">
        <div className="card tile">
          <h3>Timed MCQ exams</h3>
          <p>Practice listening, reading and language structure under real exam timing.</p>
        </div>
        <div className="card tile">
          <h3>Writing &amp; speaking</h3>
          <p>Submit your answers and get corrections and feedback from tutors.</p>
        </div>
        <div className="card tile">
          <h3>Track progress</h3>
          <p>See your scores improve and focus on the skills that matter most.</p>
        </div>
      </section>
    </>
  );
}
