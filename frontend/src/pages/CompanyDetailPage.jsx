import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCompany,
  listCompanyCategories,
  listCompanyKPI,
  listCompanyTasks,
} from "../api/companies";
import { createTask, deleteTask, updateTask } from "../api/tasks";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import { KPI_METRICS } from "../constants";

const TODAY = new Date().toISOString().slice(0, 10);

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [kpiEntries, setKpiEntries] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");

  function load() {
    getCompany(companyId).then(setCompany).catch((err) => setError(err.message));
    listCompanyCategories(companyId).then(setCategories);
    listCompanyTasks(companyId).then(setTasks);
    listCompanyKPI(companyId).then(setKpiEntries);
  }

  useEffect(load, [companyId]);

  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const todo = tasks.filter((t) => t.status === "a_faire");
  const inProgress = tasks.filter((t) => t.status === "en_cours");
  const done = tasks.filter((t) => t.status === "termine");
  const overdue = tasks.filter((t) => t.planned_date < TODAY && t.status !== "termine");

  const metrics = company ? KPI_METRICS[company.slug] || [] : [];
  const latestByKey = {};
  kpiEntries.forEach((entry) => {
    const current = latestByKey[entry.metric_key];
    if (!current || entry.week_start_date > current.week_start_date) {
      latestByKey[entry.metric_key] = entry;
    }
  });

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

  if (error) {
    return <div className="p-8 text-sm text-red-600">Erreur : {error}</div>;
  }
  if (!company) {
    return <div className="p-8 text-sm text-slate-400">Chargement…</div>;
  }

  return (
    <div>
      <Header title={company.name} subtitle="Espace dédié à cette entreprise" />

      <div className="space-y-8 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="À faire" value={todo.length} />
          <StatCard label="En cours" value={inProgress.length} accent="blue" />
          <StatCard label="Terminées" value={done.length} accent="emerald" />
          <StatCard label="En retard" value={overdue.length} accent="red" />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tâches
          </h2>
          <button
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Nouvelle tâche
          </button>
        </div>

        {overdue.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">
              En retard
            </h3>
            <TaskTable
              tasks={overdue}
              categoriesById={categoriesById}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onEdit={(t) => {
                setEditingTask(t);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          </section>
        )}

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            À faire
          </h3>
          <TaskTable
            tasks={todo}
            categoriesById={categoriesById}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onEdit={(t) => {
              setEditingTask(t);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
          />
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            En cours
          </h3>
          <TaskTable
            tasks={inProgress}
            categoriesById={categoriesById}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onEdit={(t) => {
              setEditingTask(t);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
          />
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Terminées
          </h3>
          <TaskTable tasks={done} categoriesById={categoriesById} onDelete={handleDelete} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            KPI de la semaine
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard
                key={metric.key}
                label={metric.label}
                value={latestByKey[metric.key]?.value ?? "—"}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Catégories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600"
              >
                {c.name}
              </span>
            ))}
          </div>
        </section>
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        companies={[company]}
        initialTask={editingTask}
        defaultCompanyId={company.id}
      />
    </div>
  );
}
