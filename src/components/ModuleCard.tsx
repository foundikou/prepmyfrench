import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Props = {
  titre: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  href?: string; // when set, the module is available and the card links to it
};

export function ModuleCard({ titre, description, Icon, color, href }: Props) {
  return (
    <Card className="flex flex-col transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${color} text-white shadow`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold">{titre}</h3>
      <p className="mt-1 flex-1 text-sm text-muted">{description}</p>
      {href ? (
        <Link href={href} className="mt-4 self-start text-sm font-semibold">
          Commencer →
        </Link>
      ) : (
        <span className="mt-4 inline-block self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          Bientôt disponible
        </span>
      )}
    </Card>
  );
}