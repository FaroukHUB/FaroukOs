import { useEffect, useState } from "react";
import { createBlock, deleteBlock, listBlocks, updateBlock } from "../api/blocks";
import { listCompanies } from "../api/companies";
import Header from "../components/Header";
import { useAssignees } from "../context/AssigneesContext";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants";

function BlockFields({ value, onChange, companies }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <input
        type="text"
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })}
        placeholder="Libellé"
        className="rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="time"
        value={value.start_time}
        onChange={(e) => onChange({ ...value, start_time: e.target.value })}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="time"
        value={value.end_time}
        onChange={(e) => onChange({ ...value, end_time: e.target.value })}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <select
        value={value.company_id ?? ""}
        onChange={(e) => onChange({ ...value, company_id: e.target.value || null })}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
      >
        <option value="">Transverse (aucune)</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function BlockRow({ block, companies, companiesById, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(toFormValue(block));

  function toFormValue(b) {
    return {
      label: b.label,
      start_time: b.start_time.slice(0, 5),
      end_time: b.end_time.slice(0, 5),
      company_id: b.company_id,
    };
  }

  async function handleSave() {
    await onSave(block.id, {
      label: value.label,
      start_time: value.start_time,
      end_time: value.end_time,
      company_id: value.company_id ? Number(value.company_id) : null,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="flex items-center gap-2 py-1.5">
        <BlockFields value={value} onChange={setValue} companies={companies} />
        <button
          onClick={handleSave}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          Enregistrer
        </button>
        <button
          onClick={() => {
            setValue(toFormValue(block));
            setEditing(false);
          }}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          Annuler
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 text-slate-500">
          {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
        </span>
        <span className="font-medium text-slate-900">{block.label}</span>
        <span className="text-slate-400">
          {block.company_id ? companiesById[block.company_id]?.name : "Transverse"}
        </span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
          Modifier
        </button>
        <button onClick={() => onDelete(block.id)} className="text-xs font-medium text-red-500 hover:text-red-700">
          Supprimer
        </button>
      </div>
    </li>
  );
}

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

const EMPTY_BLOCK = { label: "", start_time: "09:00", end_time: "10:00", company_id: "" };

export default function SettingsPage() {
  const [companies, setCompanies] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState(EMPTY_BLOCK);
  const [blockError, setBlockError] = useState("");
  const { assignees, rename } = useAssignees();

  useEffect(() => {
    listCompanies().then(setCompanies);
    loadBlocks();
  }, []);

  function loadBlocks() {
    listBlocks().then(setBlocks);
  }

  const companiesById = Object.fromEntries(companies.map((c) => [c.id, c]));

  async function handleSaveBlock(blockId, data) {
    try {
      await updateBlock(blockId, data);
      loadBlocks();
    } catch (err) {
      setBlockError(err.message);
    }
  }

  async function handleDeleteBlock(blockId) {
    if (!window.confirm("Supprimer ce bloc ? Les tâches déjà créées ne seront pas supprimées.")) return;
    await deleteBlock(blockId);
    loadBlocks();
  }

  async function handleCreateBlock(e) {
    e.preventDefault();
    setBlockError("");
    if (!newBlock.label.trim()) {
      setBlockError("Le libellé est obligatoire.");
      return;
    }
    try {
      await createBlock({
        label: newBlock.label,
        start_time: newBlock.start_time,
        end_time: newBlock.end_time,
        company_id: newBlock.company_id ? Number(newBlock.company_id) : null,
      });
      setNewBlock(EMPTY_BLOCK);
      loadBlocks();
    } catch (err) {
      setBlockError(err.message);
    }
  }

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
            Blocs horaires de la journée
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Un bloc = une plage horaire dédiée à une seule entreprise (ou transverse pour
            l'organisation). Utilisés par la page Aujourd'hui.
          </p>

          {blockError && (
            <div className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{blockError}</div>
          )}

          <ul className="mt-3 divide-y divide-slate-100">
            {blocks.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                companies={companies}
                companiesById={companiesById}
                onSave={handleSaveBlock}
                onDelete={handleDeleteBlock}
              />
            ))}
          </ul>

          <form onSubmit={handleCreateBlock} className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
            <BlockFields value={newBlock} onChange={setNewBlock} companies={companies} />
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + Ajouter
            </button>
          </form>
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
