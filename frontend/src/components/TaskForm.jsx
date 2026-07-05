import { useEffect, useState } from "react";
import { listCompanyCategories } from "../api/companies";
import { ASSIGNEES, TASK_PRIORITIES, TASK_STATUSES } from "../constants";

const EMPTY_TASK = {
  title: "",
  description: "",
  company_id: "",
  category_id: "",
  priority: "moyenne",
  status: "a_faire",
  estimated_minutes: 30,
  planned_date: new Date().toISOString().slice(0, 10),
  planned_time: "",
  assignee: "moi",
  notes: "",
};

export default function TaskForm({ open, onClose, onSubmit, companies, initialTask, defaultCompanyId }) {
  const [form, setForm] = useState(EMPTY_TASK);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setForm({
        ...EMPTY_TASK,
        ...initialTask,
        category_id: initialTask.category_id || "",
        planned_time: initialTask.planned_time || "",
        description: initialTask.description || "",
        notes: initialTask.notes || "",
      });
    } else {
      setForm({ ...EMPTY_TASK, company_id: defaultCompanyId || "" });
    }
    setError("");
  }, [open, initialTask, defaultCompanyId]);

  useEffect(() => {
    if (!form.company_id) {
      setCategories([]);
      return;
    }
    listCompanyCategories(form.company_id).then(setCategories).catch(() => setCategories([]));
  }, [form.company_id]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCompanyChange(value) {
    setForm((prev) => ({ ...prev, company_id: value, category_id: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!form.company_id) {
      setError("L'entreprise est obligatoire.");
      return;
    }
    try {
      await onSubmit({
        ...form,
        company_id: Number(form.company_id),
        category_id: form.category_id ? Number(form.category_id) : null,
        estimated_minutes: Number(form.estimated_minutes),
        planned_time: form.planned_time || null,
        description: form.description || null,
        notes: form.notes || null,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {initialTask ? "Modifier la tâche" : "Nouvelle tâche"}
            </h2>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Titre</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Description (facultative)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Entreprise</label>
                <select
                  value={form.company_id}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  disabled={!!initialTask}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                >
                  <option value="">—</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Catégorie</label>
                <select
                  value={form.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  disabled={!form.company_id}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                >
                  <option value="">Aucune</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Priorité</label>
                <select
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Durée (min)
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={form.estimated_minutes}
                  onChange={(e) => update("estimated_minutes", e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date prévue</label>
                <input
                  type="date"
                  value={form.planned_date}
                  onChange={(e) => update("planned_date", e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Heure (facultative)
                </label>
                <input
                  type="time"
                  value={form.planned_time || ""}
                  onChange={(e) => update("planned_time", e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Assigné à</label>
              <select
                value={form.assignee}
                onChange={(e) => update("assignee", e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {ASSIGNEES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Notes (facultatives)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
