import { useEffect, useState } from "react";
import { listCompanies } from "../api/companies";
import Header from "../components/Header";
import { useAssignees } from "../context/AssigneesContext";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants";

function AssigneeRow({ assignee, onRename }) {
  const [value, setValue] = useState(assignee.label);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(assignee.label), [assignee.label]);

  async function handleSave() {
    if (!value.trim() || value === assignee.label) return;
    setSaving(true);
    try {
      await onRename(assignee.key, value.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-48 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <button
        onClick={handleSave}
        disabled={saving || !value.trim() || value === assignee.label}
        className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Renommer
      </button>
    </li>
  );
}

export default function SettingsPage() {
  const [companies, setCompanies] = useState([]);
  const { assignees, rename } = useAssignees();

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
          <p className="mt-1 text-xs text-slate-400">
            Renommez librement (ex : remplacer "Renfort 1" par "Jean").
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {assignees.map((a) => (
              <AssigneeRow key={a.key} assignee={a} onRename={rename} />
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
