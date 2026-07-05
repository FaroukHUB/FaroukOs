import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import Dashboard from "./pages/Dashboard";
import KPIPage from "./pages/KPIPage";
import PromptsPage from "./pages/PromptsPage";
import SettingsPage from "./pages/SettingsPage";
import StagiairesPage from "./pages/StagiairesPage";
import TasksPage from "./pages/TasksPage";
import TodayPage from "./pages/TodayPage";
import WeekCalendarPage from "./pages/WeekCalendarPage";

export default function App() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/aujourdhui" element={<TodayPage />} />
          <Route path="/semaine" element={<WeekCalendarPage />} />
          <Route path="/entreprises" element={<CompaniesPage />} />
          <Route path="/entreprises/:companyId" element={<CompanyDetailPage />} />
          <Route path="/taches" element={<TasksPage />} />
          <Route path="/stagiaires" element={<StagiairesPage />} />
          <Route path="/kpi" element={<KPIPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/parametres" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}
