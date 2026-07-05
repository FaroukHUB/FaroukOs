import { useEffect, useMemo, useState } from "react";
import { listCompanies, listCompanyCategories } from "../api/companies";
import { listTasks, updateTask } from "../api/tasks";
import Header from "../components/Header";
import TaskTable from "../components/TaskTable";
import { ASSIGNEES } from "../constants";

const STAGIAIRES = ASSIGNEES.filter((a) => a.value !== "moi");

export default function StagiairesPage() {
  const [active, setActive] = useState(STAGIAIRES[0].value);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
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
    listTasks({ assignee: active }).then(setTasks).catch((err) => setError(err.message));
  }

  useEffect(load, [active]);

  const companiesById = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    [companies]
  );
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  async function handleStatusChange(taskId, status) {
    await updateTask(taskId, { status });
    load();
  }

  return (
    <div>
      <Header title="Stagiaires" subtitle="Tâches assignées à chaque stagiaire" />
      <div className="space-y-4 px-8 py-6">
        <div className="flex gap-2">
          {STAGIAIRES.map((s) => (
            <button
              key={s.value}
              onClick={() => setActive(s.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                active === s.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <TaskTable
          tasks={tasks}
          categoriesById={categoriesById}
          companiesById={companiesById}
          showCompany
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
