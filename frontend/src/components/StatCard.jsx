export default function StatCard({ label, value, accent = "slate", hint }) {
  const accents = {
    slate: "text-slate-900",
    red: "text-red-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accents[accent] || accents.slate}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
