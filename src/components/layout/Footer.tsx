export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} PrepMyFrench. Tous droits réservés.</p>
        <p>Préparez votre TCF Canada en toute confiance.</p>
      </div>
    </footer>
  );
}