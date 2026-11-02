import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepMyFrench — Préparez votre TCF Canada",
  description:
    "Examens blancs chronométrés, corrections détaillées et entraînement interactif pour réussir le TCF Canada.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}