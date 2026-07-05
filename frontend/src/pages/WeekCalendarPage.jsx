import { useEffect, useState } from "react";
import { getWeekTasks } from "../api/tasks";
import Header from "../components/Header";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function WeekCalendarPage() {
  const [week, setWeek] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getWeekTasks().then(setWeek).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="p-8 text-sm text-red-600">Erreur : {error}</div>;
  }
  if (!week) {
    return <div className="p-8 text-sm text-slate-400">Chargement…</div>;
  }

  return (
    <div>
      <Header
        title="Calendrier semaine"
        subtitle={`Du ${week.week_start} au ${week.week_end}`}
      />
      <div className="grid grid-cols-1 gap-4 px-8 py-6 md:grid-cols-5">
        {week.days.map((day) => (
          <div key={day.date} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-slate-900">{day.weekday_label}</h3>
              <span className="text-xs text-slate-400">{day.date}</span>
            </div>
            <div
              className={`mt-1 text-sm font-medium ${
                day.overloaded ? "text-red-600" : "text-slate-500"
              }`}
            >
              {formatMinutes(day.total_estimated_minutes)}
            </div>
            {day.overloaded && (
              <div className="mt-1 text-xs font-medium text-red-600">
                Charge trop élevée, reporte ou délègue une tâche.
              </div>
            )}
            {day.companies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {day.companies.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 space-y-2">
              {day.tasks.length === 0 ? (
                <p className="text-xs text-slate-400">Aucune tâche.</p>
              ) : (
                day.tasks.map((task) => (
                  <div key={task.id} className="rounded border border-slate-100 p-2">
                    <div className="text-sm font-medium text-slate-800">{task.title}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
