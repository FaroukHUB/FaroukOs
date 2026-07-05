import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function TaskCard({ task, companyName }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="font-medium text-slate-900 truncate">{task.title}</div>
        <div className="mt-1 text-xs text-slate-500">
          {companyName && <span className="mr-2">{companyName}</span>}
          {task.planned_date}
          {task.estimated_minutes ? ` · ${task.estimated_minutes} min` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
    </div>
  );
}
