import { useState } from "react";
import { labelFor, PROMPT_TYPES } from "../constants";

export default function PromptCard({ prompt, onDelete }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900">{prompt.title}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          {labelFor(PROMPT_TYPES, prompt.prompt_type)}
        </span>
      </div>
      <p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-slate-600 line-clamp-6">
        {prompt.content}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(prompt.id)}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
