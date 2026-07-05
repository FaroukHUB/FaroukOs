import { COMPANY_COLORS, NEUTRAL_BLOCK_COLOR } from "../constants";

function formatTime(value) {
  return value.slice(0, 5).replace(":", "h");
}

export default function Timeline({ blocks, companiesById, selectedBlockId, onSelect, statsByBlock = {} }) {
  return (
    <div className="space-y-1.5">
      {blocks.map((block) => {
        const company = block.company_id ? companiesById[block.company_id] : null;
        const colors = company ? COMPANY_COLORS[company.slug] || NEUTRAL_BLOCK_COLOR : NEUTRAL_BLOCK_COLOR;
        const isSelected = block.id === selectedBlockId;
        const stats = statsByBlock[block.id] || { count: 0, minutes: 0 };

        return (
          <button
            key={block.id}
            onClick={() => onSelect(block)}
            className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
              isSelected
                ? `${colors.bg} ${colors.border} ring-1 ring-inset ${colors.border}`
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
              <span className="text-xs font-medium text-slate-500">
                {formatTime(block.start_time)} - {formatTime(block.end_time)}
              </span>
            </div>
            <div className={`mt-0.5 font-semibold ${isSelected ? colors.text : "text-slate-900"}`}>
              {block.label}
            </div>
            {stats.count > 0 && (
              <div className="mt-0.5 text-xs text-slate-400">
                {stats.count} tâche{stats.count > 1 ? "s" : ""} · {stats.minutes} min
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
