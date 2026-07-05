import { labelFor, TASK_STATUSES } from "../constants";

const COLORS = {
  a_faire: "bg-slate-100 text-slate-700",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-emerald-100 text-emerald-700",
  delegue: "bg-purple-100 text-purple-700",
  reporte: "bg-amber-100 text-amber-700",
  bloque: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        COLORS[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {labelFor(TASK_STATUSES, status)}
    </span>
  );
}
