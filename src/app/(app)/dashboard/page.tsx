import { redirect } from "next/navigation";
import { BookOpen, Headphones, Mic, PenTool, Sparkles, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/session";

export const metadata = { title: "Tableau de bord | PrepMyFrench" };

const ROLES: Record<string, string> = {
  student: "Étudiant",
  tutor: "Tuteur",
  admin: "Administrateur",
};

const MODULES = [
  {
    titre: "Compréhension orale",
    description: "Questions à choix multiples chronométrées à partir d'enregistrements audio.",
    Icon: Headphones,
    color: "from-cyan-500 to-blue-600",
  },
  {
    titre: "Compréhension écrite",
    description: "Textes variés et questions à choix multiples, en temps limité.",
    Icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
  },
  {
    titre: "Expression écrite",
    description: "Rédigez vos réponses et recevez une correction détaillée d'un correcteur.",
    Icon: PenTool,
    color: "from-blue-500 to-indigo-600",
  },
  {
    titre: "Expression orale",
    description: "Enregistrez vos réponses et obtenez des retours personnalisés.",
    Icon: Mic,
    color: "from-purple-500 to-pink-600",
  },
  {
    titre: "Examen blanc",
    description: "Toutes les épreuves à la suite, en conditions réelles.",
    Icon: Sparkles,
    color: "from-rose-500 to-red-600",
  },
];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const firstName = capitalize(session.fullName.split(" ")[0]);
  const role = ROLES[String(session.role).toLowerCase()] ?? session.role;

  return (
    <>
      <section className="mt-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-lg sm:p-10">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {role}
        </span>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">Bonjour, {firstName}&nbsp;!</h1>
        <p className="mt-2 max-w-xl text-blue-100">
          Prêt à progresser&nbsp;? Choisissez une épreuve ci-dessous pour préparer votre TCF Canada.
        </p>
        <p className="mt-4 text-sm text-blue-200">Connecté en tant que {session.email}</p>
      </section>

      <section className="card mt-6 flex items-start gap-4">
        <div className="rounded-xl bg-brand/10 p-3 text-brand">
          <TrendingUp className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Ma progression</h2>
          <p className="mt-1 text-muted">
            Aucun examen passé pour le moment. Dès que les épreuves seront disponibles, votre
            historique de scores et vos points faibles apparaîtront ici.
          </p>
        </div>
      </section>

      <section aria-labelledby="epreuves-titre" className="mt-10">
        <h2 id="epreuves-titre" className="text-xl font-bold">
          Vos épreuves d&apos;entraînement
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ titre, description, Icon, color }) => (
            <article key={titre} className="card flex flex-col transition hover:-translate-y-0.5 hover:shadow-md">
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${color} text-white shadow`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold">{titre}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{description}</p>
              <span className="mt-4 inline-block self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Bientôt disponible
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}