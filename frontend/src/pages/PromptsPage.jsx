import { useEffect, useState } from "react";
import { listCompanies } from "../api/companies";
import { createPrompt, deletePrompt, listPrompts } from "../api/prompts";
import Header from "../components/Header";
import PromptCard from "../components/PromptCard";
import { PROMPT_TYPES } from "../constants";

const EMPTY_NEW_PROMPT = {
  company_id: "",
  prompt_type: PROMPT_TYPES[0].value,
  title: "",
  content: "",
};

export default function PromptsPage() {
  const [companies, setCompanies] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [filters, setFilters] = useState({ company_id: "", prompt_type: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState(EMPTY_NEW_PROMPT);
  const [error, setError] = useState("");

  useEffect(() => {
    listCompanies().then(setCompanies);
  }, []);

  function load() {
    listPrompts(filters).then(setPrompts).catch((err) => setError(err.message));
  }

  useEffect(load, [filters]);

  async function handleDelete(promptId) {
    if (!window.confirm("Supprimer ce prompt ?")) return;
    await deletePrompt(promptId);
    load();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newPrompt.company_id || !newPrompt.title.trim() || !newPrompt.content.trim()) {
      setError("Entreprise, titre et contenu sont obligatoires.");
      return;
    }
    try {
      await createPrompt({ ...newPrompt, company_id: Number(newPrompt.company_id) });
      setNewPrompt(EMPTY_NEW_PROMPT);
      setFormOpen(false);
      setError("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Header title="Prompts IA" subtitle="Prompts prêts à copier-coller, par entreprise" />

      <div className="space-y-4 px-8 py-6">
        {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">Entreprise</label>
            <select
              value={filters.company_id}
              onChange={(e) => setFilters((f) => ({ ...f, company_id: e.target.value }))}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Toutes</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Type</label>
            <select
              value={filters.prompt_type}
              onChange={(e) => setFilters((f) => ({ ...f, prompt_type: e.target.value }))}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Tous</option>
              {PROMPT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFormOpen((v) => !v)}
            className="ml-auto rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {formOpen ? "Fermer" : "+ Nouveau prompt"}
          </button>
        </div>

        {formOpen && (
          <form
            onSubmit={handleCreate}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500">Entreprise</label>
                <select
                  value={newPrompt.company_id}
                  onChange={(e) =>
                    setNewPrompt((p) => ({ ...p, company_id: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
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
                <label className="block text-xs font-medium text-slate-500">Type</label>
                <select
                  value={newPrompt.prompt_type}
                  onChange={(e) =>
                    setNewPrompt((p) => ({ ...p, prompt_type: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                >
                  {PROMPT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Titre</label>
              <input
                type="text"
                value={newPrompt.title}
                onChange={(e) => setNewPrompt((p) => ({ ...p, title: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Contenu</label>
              <textarea
                value={newPrompt.content}
                onChange={(e) => setNewPrompt((p) => ({ ...p, content: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
