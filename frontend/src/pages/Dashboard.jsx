import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";
import CompanyCard from "../components/CompanyCard";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">
        Impossible de charger le dashboard : {error}
      </div>
    );
  }
  if (!data) {
    return <div className="p-8 text-sm text-slate-400">Chargement…</div>;
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Vue d'ensemble de la journée" />

      <div className="space-y-8 px-8 py-6">
        {data.overloaded_today && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Charge trop élevée, reporte ou délègue une tâche.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Tâches aujourd'hui" value={data.tasks_today_count} />
          <StatCard
            label="Terminées aujourd'hui"
            value={data.tasks_today_completed_count}
            accent="emerald"
          />
          <StatCard
            label="Charge prévue"
            value={formatMinutes(data.workload_today_minutes)}
            accent={data.overloaded_today ? "red" : "slate"}
            hint="sur 10h max recommandé"
          />
          <StatCard
            label="Progression semaine"
            value={`${data.week_progress.percent}%`}
            accent="blue"
            hint={`${data.week_progress.completed_tasks} / ${data.week_progress.total_tasks} tâches`}
          />
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tâches prioritaires du jour
          </h2>
          {data.priority_tasks_today.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune tâche haute priorité aujourd'hui.</p>
          ) : (
            <div className="space-y-2">
              {data.priority_tasks_today.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tâches en retard
          </h2>
          {data.overdue_tasks.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune tâche en retard.</p>
          ) : (
            <div className="space-y-2">
              {data.overdue_tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Résumé par entreprise
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.companies_summary.map((item) => (
              <CompanyCard key={item.company.id} company={item.company} summary={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
