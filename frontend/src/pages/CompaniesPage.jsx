import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";
import CompanyCard from "../components/CompanyCard";
import Header from "../components/Header";

export default function CompaniesPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((data) => setSummary(data.companies_summary))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="p-8 text-sm text-red-600">Erreur : {error}</div>;
  }
  if (!summary) {
    return <div className="p-8 text-sm text-slate-400">Chargement…</div>;
  }

  return (
    <div>
      <Header title="Entreprises" subtitle="Chaque entreprise a son espace dédié et isolé" />
      <div className="grid grid-cols-1 gap-4 px-8 py-6 md:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <CompanyCard key={item.company.id} company={item.company} summary={item} />
        ))}
      </div>
    </div>
  );
}
