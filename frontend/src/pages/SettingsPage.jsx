import { useEffect, useState } from "react";
import { listCompanies } from "../api/companies";
import Header from "../components/Header";
import { ASSIGNEES, TASK_PRIORITIES, TASK_STATUSES } from "../constants";

export default function SettingsPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    listCompanies().then(setCompanies);
  }, []);

  return (
    <div>
      <Header title="Paramètres" subtitle="Application privée — usage local" />
      <div className="space-y-6 px-8 py-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Entreprises gérées
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {companies.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Statuts de tâche
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {TASK_STATUSES.map((s) => (
              <li key={s.value}>{s.label}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Priorités
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {TASK_PRIORITIES.map((p) => (
              <li key={p.value}>{p.label}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Assignation
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {ASSIGNEES.map((a) => (
              <li key={a.value}>{a.label}</li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-slate-400">
          Application privée sans authentification en V1. Une authentification pourra être
          ajoutée plus tard sans changer la structure existante.
        </p>
      </div>
    </div>
  );
}
