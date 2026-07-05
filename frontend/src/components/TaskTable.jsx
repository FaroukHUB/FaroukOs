import { useAssignees } from "../context/AssigneesContext";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function TaskTable({
  tasks,
  categoriesById = {},
  companiesById = {},
  showCompany = false,
  onStatusChange,
  onPriorityChange,
  onToggleDone,
  onEdit,
  onDelete,
}) {
  const { labelFor: assigneeLabelFor } = useAssignees();

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
        Aucune tâche.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
          <tr>
            {onToggleDone && <th className="px-4 py-3" />}
            <th className="px-4 py-3">Tâche</th>
            {showCompany && <th className="px-4 py-3">Entreprise</th>}
            <th className="px-4 py-3">Catégorie</th>
            <th className="px-4 py-3">Priorité</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Durée</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Assigné</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <tr key={task.id} className={task.status === "termine" ? "opacity-60" : ""}>
              {onToggleDone && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={task.status === "termine"}
                    onChange={(e) => onToggleDone(task.id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </td>
              )}
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-slate-500 mt-0.5">{task.description}</div>
                )}
              </td>
              {showCompany && (
                <td className="px-4 py-3 text-slate-600">
                  {companiesById[task.company_id]?.name || "—"}
                </td>
              )}
              <td className="px-4 py-3 text-slate-600">
                {categoriesById[task.category_id]?.name || "—"}
              </td>
              <td className="px-4 py-3">
                {onPriorityChange ? (
                  <select
                    value={task.priority}
                    onChange={(e) => onPriorityChange(task.id, e.target.value)}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <PriorityBadge priority={task.priority} />
                )}
              </td>
              <td className="px-4 py-3">
                {onStatusChange ? (
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={task.status} />
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">{task.estimated_minutes} min</td>
              <td className="px-4 py-3 text-slate-600">{task.planned_date}</td>
              <td className="px-4 py-3 text-slate-600">{assigneeLabelFor(task.assignee)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(task)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
