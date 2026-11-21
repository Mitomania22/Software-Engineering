import type { Verdict } from '@/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface VerdictBannerProps {
  verdict: Verdict | null;
}

export default function VerdictBanner({ verdict }: VerdictBannerProps) {
  if (!verdict) return null;

  const isAvailable = verdict.available;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'rounded-xl border p-4 transition-all duration-200',
        isAvailable
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {isAvailable ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}
        <div className="min-w-0">
          <p
            className={[
              'text-sm font-bold',
              isAvailable ? 'text-emerald-800' : 'text-red-800',
            ].join(' ')}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </p>
          <p
            className={[
              'mt-0.5 text-sm',
              isAvailable ? 'text-emerald-700' : 'text-red-700',
            ].join(' ')}
          >
            {verdict.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
