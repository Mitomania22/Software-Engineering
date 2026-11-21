import type { ExplanationState } from '@/utils/explain';
import { Sparkles, Loader2 } from 'lucide-react';

interface ExplanationCardProps {
  state: ExplanationState;
}

export default function ExplanationCard({ state }: ExplanationCardProps) {
  if (state.status === 'idle') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-sky-200 bg-sky-50 p-4"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-sky-800">Explanation</p>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
              Mock AI
            </span>
          </div>
          {state.status === 'loading' ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-sky-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating a short explanation…
            </p>
          ) : state.status === 'fallback' ? (
            <p className="mt-1 text-sm text-sky-700">{state.text}</p>
          ) : (
            <p className="mt-1 text-sm text-sky-700">{state.text}</p>
          )}
          <p className="mt-2 text-xs text-sky-600/70">
            This text is generated for display only — the availability decision
            above is final and rule-based.
          </p>
        </div>
      </div>
    </div>
  );
}
