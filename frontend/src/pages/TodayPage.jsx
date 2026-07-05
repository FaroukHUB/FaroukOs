import { useEffect, useState } from "react";
import { listCompanies } from "../api/companies";
import { getTodayTasks, updateTask } from "../api/tasks";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TaskTable from "../components/TaskTable";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function TodayPage() {
  const [today, setToday] = useState(null);
  const [companiesById, setCompaniesById] = useState({});
  const [error, setError] = useState("");

  function load() {
    getTodayTasks().then(setToday).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
    listCompanies().then((list) => {
      setCompaniesById(Object.fromEntries(list.map((c) => [c.id, c])));
    });
  }, []);

  async function handleStatusChange(taskId, status) {
    await updateTask(taskId, { status });
    load();
  }

  async function handlePriorityChange(taskId, priority) {
    await updateTask(taskId, { priority });
    load();
  }

  async function handleToggleDone(taskId, done) {
    await updateTask(taskId, { status: done ? "termine" : "a_faire" });
    load();
  }

  if (error) {
    return <div className="p-8 text-sm text-red-600">Erreur : {error}</div>;
  }
  if (!today) {
    return <div className="p-8 text-sm text-slate-400">Chargement…</div>;
  }

  return (
    <div>
      <Header title="Aujourd'hui" subtitle="Uniquement les tâches prévues aujourd'hui" />
      <div className="space-y-6 px-8 py-6">
        {today.overloaded && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Charge trop élevée, reporte ou délègue une tâche.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Tâches du jour" value={today.tasks.length} />
          <StatCard
            label="Durée totale estimée"
            value={formatMinutes(today.total_estimated_minutes)}
            accent={today.overloaded ? "red" : "slate"}
          />
          <StatCard
            label="Terminées"
            value={today.tasks.filter((t) => t.status === "termine").length}
            accent="emerald"
          />
        </div>

        <TaskTable
          tasks={today.tasks}
          companiesById={companiesById}
          showCompany
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onToggleDone={handleToggleDone}
        />
      </div>
    </div>
  );
}
