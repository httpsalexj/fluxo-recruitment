import type { CandidateStatus } from '../types';

const styles: Record<CandidateStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-400/10 dark:text-rose-300'
};

const labels: Record<CandidateStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Reprovado'
};

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[status]}`}>{labels[status]}</span>;
}
