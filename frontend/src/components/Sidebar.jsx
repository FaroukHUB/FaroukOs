import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/aujourdhui", label: "Aujourd'hui" },
  { to: "/semaine", label: "Calendrier semaine" },
  { to: "/entreprises", label: "Entreprises" },
  { to: "/taches", label: "Tâches" },
  { to: "/stagiaires", label: "Stagiaires" },
  { to: "/kpi", label: "KPI" },
  { to: "/prompts", label: "Prompts IA" },
  { to: "/parametres", label: "Paramètres" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-800">
        <span className="text-lg font-semibold text-white">Farouk OS</span>
      </div>
      <nav className="flex-1 py-3">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `block px-5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-800 text-white border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border-l-2 border-transparent"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-500">
        Usage privé — Farouk
      </div>
    </aside>
  );
}
