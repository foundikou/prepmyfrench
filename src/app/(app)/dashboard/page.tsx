import { redirect } from "next/navigation";
import { BookOpen, Headphones, Mic, PenTool, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSession } from "@/lib/session";
import { dbQuery } from "@/lib/exams";
import { SECTIONS } from "@/lib/sections";
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressCard } from "@/components/ProgressCard";

export const metadata = { title: "Tableau de bord | PrepMyFrench" };

const ROLES: Record<string, string> = {
  student: "Étudiant",
  tutor: "Tuteur",
  admin: "Administrateur",
};

type Module = {
  titre: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  slug?: keyof typeof SECTIONS; // sections that have an /epreuves page
};

const MODULES: Module[] = [
  {
    titre: "Compréhension orale",
    description: "Questions à choix multiples chronométrées à partir d'enregistrements audio.",
    Icon: Headphones,
    color: "from-cyan-500 to-blue-600",
    slug: "comprehension-orale",
  },
  {
    titre: "Compréhension écrite",
    description: "Textes variés et questions à choix multiples, en temps limité.",
    Icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    slug: "comprehension-ecrite",
  },
  {
    titre: "Expression écrite",
    description: "Rédigez vos réponses et recevez une correction détaillée d'un correcteur.",
    Icon: PenTool,
    color: "from-blue-500 to-indigo-600",
    slug: "expression-ecrite",
  },
  {
    titre: "Expression orale",
    description: "Enregistrez vos réponses et obtenez des retours personnalisés.",
    Icon: Mic,
    color: "from-purple-500 to-pink-600",
    slug: "expression-orale",
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

  // A card links to its section page only when that section has a published exam.
  const rows = await dbQuery("SELECT DISTINCT skill FROM exams WHERE is_published = true");
  const available = new Set(rows.map((r) => r.skill as string));

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

      <ProgressCard userId={session.userId} role={session.role} />

      <section aria-labelledby="epreuves-titre" className="mt-10">
        <h2 id="epreuves-titre" className="text-xl font-bold">
          Vos épreuves d&apos;entraînement
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <ModuleCard
              key={m.titre}
              titre={m.titre}
              description={m.description}
              Icon={m.Icon}
              color={m.color}
              href={m.slug && available.has(SECTIONS[m.slug].skill) ? `/epreuves/${m.slug}` : undefined}
            />
          ))}
        </div>
      </section>
    </>
  );
}