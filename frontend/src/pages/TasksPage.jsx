import { useEffect, useMemo, useState } from "react";
import { listCompanies, listCompanyCategories } from "../api/companies";
import { createTask, deleteTask, listTasks, updateTask } from "../api/tasks";
import Header from "../components/Header";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import { ASSIGNEES, TASK_PRIORITIES, TASK_STATUSES } from "../constants";

const EMPTY_FILTERS = {
  company_id: "",
  category_id: "",
  status: "",
  priority: "",
  planned_date: "",
  assignee: "",
};

export default function TasksPage() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    Promise.all(companies.map((c) => listCompanyCategories(c.id))).then((lists) =>
      setCategories(lists.flat())
    );
  }, [companies]);

  function load() {
    listTasks(filters).then(setTasks).catch((err) => setError(err.message));
  }

  useEffect(load, [filters]);

  const companiesById = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    [companies]
  );
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );
  const availableCategories = filters.company_id
    ? categories.filter((c) => c.company_id === Number(filters.company_id))
    : categories;

  function updateFilter(field, value) {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "company_id" ? { category_id: "" } : {}),
    }));
  }

  async function handleStatusChange(taskId, status) {
    await updateTask(taskId, { status });
    load();
  }

  async function handlePriorityChange(taskId, priority) {
    await updateTask(taskId, { priority });
    load();
  }

  async function handleDelete(taskId) {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await deleteTask(taskId);
    load();
  }

  async function handleSubmit(data) {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setFormOpen(false);
    setEditingTask(null);
    load();
  }

  return (
    <div>
      <Header title="Tâches" subtitle="Toutes les tâches, filtrables par entreprise" />

      <div className="space-y-4 px-8 py-6">
        {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">Entreprise</label>
            <select
              value={filters.company_id}
              onChange={(e) => updateFilter("company_id", e.target.value)}
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
            <label className="block text-xs font-medium text-slate-500">Catégorie</label>
            <select
              value={filters.category_id}
              onChange={(e) => updateFilter("category_id", e.target.value)}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Toutes</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Tous</option>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Priorité</label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Toutes</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Date</label>
            <input
              type="date"
              value={filters.planned_date}
              onChange={(e) => updateFilter("planned_date", e.target.value)}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Assigné à</label>
            <select
              value={filters.assignee}
              onChange={(e) => updateFilter("assignee", e.target.value)}
              className="mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Tous</option>
              {ASSIGNEES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {(filters.company_id ||
            filters.category_id ||
            filters.status ||
            filters.priority ||
            filters.planned_date ||
            filters.assignee) && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Réinitialiser
            </button>
          )}

          <button
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
            className="ml-auto rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Nouvelle tâche
          </button>
        </div>

        <TaskTable
          tasks={tasks}
          categoriesById={categoriesById}
          companiesById={companiesById}
          showCompany
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onEdit={(t) => {
            setEditingTask(t);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        companies={companies}
        initialTask={editingTask}
      />
    </div>
  );
}
