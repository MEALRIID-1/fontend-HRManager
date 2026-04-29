import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Accès refusé</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Vous n’avez pas les droits pour accéder à cette page.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Vérifiez votre rôle ou retournez sur votre tableau de bord autorisé.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}