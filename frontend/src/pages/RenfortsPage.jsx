import { useEffect, useMemo, useState } from "react";
import { listCompanies, listCompanyCategories } from "../api/companies";
import { listTasks, updateTask } from "../api/tasks";
import Header from "../components/Header";
import TaskTable from "../components/TaskTable";
import { useAssignees } from "../context/AssigneesContext";

export default function RenfortsPage() {
  const { assignees } = useAssignees();
  const renforts = assignees.filter((a) => a.key !== "moi");
  const [active, setActive] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active && renforts.length > 0) setActive(renforts[0].key);
  }, [renforts, active]);

  useEffect(() => {
    listCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    Promise.all(companies.map((c) => listCompanyCategories(c.id))).then((lists) =>
      setCategories(lists.flat())
    );
  }, [companies]);

  function load() {
    if (!active) return;
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
      <Header title="Renforts" subtitle="Tâches assignées à chaque renfort" />
      <div className="space-y-4 px-8 py-6">
        <div className="flex gap-2">
          {renforts.map((r) => (
            <button
              key={r.key}
              onClick={() => setActive(r.key)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                active === r.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {r.label}
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
