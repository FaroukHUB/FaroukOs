import { useEffect, useMemo, useState } from "react";
import { listBlocks } from "../api/blocks";
import { listCompanies, listCompanyCategories } from "../api/companies";
import { createTask, deleteTask, getTodayTasks, updateTask } from "../api/tasks";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import Timeline from "../components/Timeline";
import WorkflowPicker from "../components/WorkflowPicker";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function TodayPage() {
  const [blocks, setBlocks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [today, setToday] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [error, setError] = useState("");

  function loadToday() {
    getTodayTasks().then(setToday).catch((err) => setError(err.message));
  }

  useEffect(() => {
    listBlocks().then((list) => {
      setBlocks(list);
      if (list.length > 0) setSelectedBlockId(list[0].id);
    });
    listCompanies().then(setCompanies);
    loadToday();
  }, []);

  useEffect(() => {
    if (companies.length === 0) return;
    Promise.all(companies.map((c) => listCompanyCategories(c.id))).then((lists) =>
      setCategories(lists.flat())
    );
  }, [companies]);

  const companiesById = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    [companies]
  );
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  const tasks = today?.tasks || [];
  const statsByBlock = useMemo(() => {
    const stats = {};
    for (const task of tasks) {
      if (!task.block_id) continue;
      if (!stats[task.block_id]) stats[task.block_id] = { count: 0, minutes: 0 };
      stats[task.block_id].count += 1;
      stats[task.block_id].minutes += task.estimated_minutes;
    }
    return stats;
  }, [tasks]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const blockTasks = tasks.filter((t) => t.block_id === selectedBlockId);
  const blockCompany = selectedBlock?.company_id ? companiesById[selectedBlock.company_id] : null;

  async function handleStatusChange(taskId, status) {
    await updateTask(taskId, { status });
    loadToday();
  }

  async function handlePriorityChange(taskId, priority) {
    await updateTask(taskId, { priority });
    loadToday();
  }

  async function handleToggleDone(taskId, done) {
    await updateTask(taskId, { status: done ? "termine" : "a_faire" });
    loadToday();
  }

  async function handleDelete(taskId) {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await deleteTask(taskId);
    loadToday();
  }

  async function handleSubmit(data) {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setFormOpen(false);
    setEditingTask(null);
    loadToday();
  }

  if (error) {
    return <div className="p-8 text-sm text-red-600">Erreur : {error}</div>;
  }
  if (!today || blocks.length === 0) {
    return <div className="p-8 text-sm text-slate-400">Chargement…</div>;
  }

  return (
    <div>
      <Header title="Aujourd'hui" subtitle="Un bloc à la fois, une seule entreprise à la fois" />

      <div className="space-y-4 px-8 py-6">
        {today.overloaded && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Charge trop élevée, reporte ou délègue une tâche.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Tâches du jour" value={tasks.length} />
          <StatCard
            label="Durée totale estimée"
            value={formatMinutes(today.total_estimated_minutes)}
            accent={today.overloaded ? "red" : "slate"}
          />
          <StatCard
            label="Terminées"
            value={tasks.filter((t) => t.status === "termine").length}
            accent="emerald"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <Timeline
            blocks={blocks}
            companiesById={companiesById}
            selectedBlockId={selectedBlockId}
            onSelect={(b) => setSelectedBlockId(b.id)}
            statsByBlock={statsByBlock}
          />

          {selectedBlock && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedBlock.label}</h2>
                  <p className="text-sm text-slate-500">
                    {selectedBlock.start_time.slice(0, 5)} - {selectedBlock.end_time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {blockCompany && (
                    <button
                      onClick={() => setWorkflowOpen(true)}
                      className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      + Ajouter un workflow
                    </button>
                  )}
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
              </div>

              <TaskTable
                tasks={blockTasks}
                categoriesById={categoriesById}
                companiesById={companiesById}
                showCompany={!blockCompany}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onToggleDone={handleToggleDone}
                onEdit={(t) => {
                  setEditingTask(t);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        companies={blockCompany ? [blockCompany] : companies}
        initialTask={editingTask}
        defaultCompanyId={blockCompany?.id}
        defaultBlockId={selectedBlockId}
        lockCompany={!!blockCompany}
      />

      {blockCompany && (
        <WorkflowPicker
          open={workflowOpen}
          onClose={() => setWorkflowOpen(false)}
          companyId={blockCompany.id}
          companyName={blockCompany.name}
          blockId={selectedBlockId}
          plannedDate={today.date}
          onApplied={loadToday}
        />
      )}
    </div>
  );
}
