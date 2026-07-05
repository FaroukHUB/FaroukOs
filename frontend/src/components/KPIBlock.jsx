import { useEffect, useState } from "react";

export default function KPIBlock({ metric, currentValue, history, onSave }) {
  const [value, setValue] = useState(currentValue ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(currentValue ?? "");
  }, [currentValue]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(metric.key, Number(value) || 0);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div>
        <div className="font-medium text-slate-900">{metric.label}</div>
        {history.length > 0 && (
          <div className="mt-0.5 text-xs text-slate-400">
            Semaines précédentes : {history.join(" · ")}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-right"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
