import { Link } from "react-router-dom";

export default function CompanyCard({ company, summary }) {
  return (
    <Link
      to={`/entreprises/${company.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
      {summary && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <div className="text-base font-semibold text-slate-700">{summary.todo}</div>
            <div className="text-slate-400">À faire</div>
          </div>
          <div>
            <div className="text-base font-semibold text-blue-600">{summary.in_progress}</div>
            <div className="text-slate-400">En cours</div>
          </div>
          <div>
            <div className="text-base font-semibold text-emerald-600">{summary.done}</div>
            <div className="text-slate-400">Terminé</div>
          </div>
          <div>
            <div className="text-base font-semibold text-red-600">{summary.overdue}</div>
            <div className="text-slate-400">Retard</div>
          </div>
        </div>
      )}
    </Link>
  );
}
