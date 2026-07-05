import { useEffect, useState } from "react";
import { listCompanies } from "../api/companies";
import { listKPI, saveKPIEntry } from "../api/kpi";
import Header from "../components/Header";
import KPIBlock from "../components/KPIBlock";
import { KPI_METRICS } from "../constants";

function getCurrentWeekStart() {
  const now = new Date();
  const weekday = (now.getDay() + 6) % 7; // Lundi=0 ... Dimanche=6
  const d = new Date(now);
  if (weekday >= 5) {
    d.setDate(d.getDate() + (7 - weekday));
  } else {
    d.setDate(d.getDate() - weekday);
  }
  return d.toISOString().slice(0, 10);
}

const WEEK_START = getCurrentWeekStart();

export default function KPIPage() {
  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    listCompanies().then((list) => {
      setCompanies(list);
      if (list.length > 0) setActiveCompanyId(list[0].id);
    });
  }, []);

  function load() {
    if (!activeCompanyId) return;
    listKPI({ company_id: activeCompanyId }).then(setEntries);
  }

  useEffect(load, [activeCompanyId]);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  const metrics = activeCompany ? KPI_METRICS[activeCompany.slug] || [] : [];

  async function handleSave(metricKey, value) {
    await saveKPIEntry({
      company_id: activeCompanyId,
      metric_key: metricKey,
      week_start_date: WEEK_START,
      value,
    });
    load();
  }

  return (
    <div>
      <Header title="KPI" subtitle="Suivi hebdomadaire, saisie manuelle" />
      <div className="space-y-4 px-8 py-6">
        <div className="flex gap-2">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCompanyId(c.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                activeCompanyId === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          Semaine en cours : à partir du {WEEK_START}
        </p>

        <div className="space-y-2">
          {metrics.map((metric) => {
            const metricEntries = entries
              .filter((e) => e.metric_key === metric.key)
              .sort((a, b) => (a.week_start_date < b.week_start_date ? 1 : -1));
            const current = metricEntries.find((e) => e.week_start_date === WEEK_START);
            const history = metricEntries
              .filter((e) => e.week_start_date !== WEEK_START)
              .slice(0, 3)
              .map((e) => `${e.value} (${e.week_start_date})`);

            return (
              <KPIBlock
                key={metric.key}
                metric={metric}
                currentValue={current?.value}
                history={history}
                onSave={handleSave}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
