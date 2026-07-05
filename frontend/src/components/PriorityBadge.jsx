import { labelFor, TASK_PRIORITIES } from "../constants";

const COLORS = {
  haute: "bg-red-100 text-red-700",
  moyenne: "bg-amber-100 text-amber-700",
  basse: "bg-slate-100 text-slate-600",
};

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        COLORS[priority] || "bg-slate-100 text-slate-600"
      }`}
    >
      {labelFor(TASK_PRIORITIES, priority)}
    </span>
  );
}
