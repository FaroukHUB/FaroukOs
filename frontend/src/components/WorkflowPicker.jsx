import { useEffect, useState } from "react";
import { listCompanyWorkflows } from "../api/companies";
import { applyWorkflow } from "../api/tasks";

export default function WorkflowPicker({ open, onClose, companyId, companyName, blockId, plannedDate, onApplied }) {
  const [workflows, setWorkflows] = useState([]);
  const [applyingName, setApplyingName] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    listCompanyWorkflows(companyId).then(setWorkflows).catch((err) => setError(err.message));
  }, [open, companyId]);

  if (!open) return null;

  async function handleApply(workflow) {
    setApplyingName(workflow.name);
    try {
      await applyWorkflow({
        company_id: companyId,
        workflow_name: workflow.name,
        planned_date: plannedDate,
        block_id: blockId,
      });
      onApplied();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingName(null);
    }
  }

  const totalMinutes = (workflow) => workflow.items.reduce((sum, i) => sum + i.minutes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Ajouter un workflow</h2>
          <p className="mt-0.5 text-sm text-slate-500">{companyName}</p>
        </div>

        <div className="max-h-[70vh] space-y-2 overflow-y-auto px-6 py-4">
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {workflows.map((workflow) => (
            <div
              key={workflow.name}
              className="rounded-lg border border-slate-200 p-3 hover:border-blue-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{workflow.name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {workflow.items.length} sous-tâches · {totalMinutes(workflow)} min
                  </div>
                </div>
                <button
                  onClick={() => handleApply(workflow)}
                  disabled={applyingName === workflow.name}
                  className="shrink-0 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {applyingName === workflow.name ? "Ajout..." : "Ajouter"}
                </button>
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                {workflow.items.map((item) => (
                  <li key={item.title}>· {item.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
