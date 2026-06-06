import { useEffect, useMemo, useState } from 'react';
import { Download, LogOut, RefreshCw, Search } from 'lucide-react';
import { API_URL, apiFetch, apiUrl } from '../api/client';
import type { Admin, Candidate, CandidateStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

type Filter = CandidateStatus | 'all';

type CandidateResponse = {
  items: Candidate[];
  total: number;
  counts: Partial<Record<CandidateStatus, number>>;
};

type AuditLog = {
  _id: string;
  action: string;
  adminName: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

const filterLabels: Record<Filter, string> = {
  all: 'Todos',
  pending: 'Pendentes',
  approved: 'Aprovados',
  rejected: 'Reprovados'
};

export function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<CandidateResponse>({ items: [], total: 0, counts: {} });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ status: filter, search });
    const [me, candidates, audit] = await Promise.all([
      apiFetch<{ admin: Admin }>('/api/admin/me'),
      apiFetch<CandidateResponse>(`/api/admin/candidates?${params.toString()}`),
      apiFetch<{ items: AuditLog[] }>('/api/admin/audit-logs?limit=8')
    ]);
    setAdmin(me.admin);
    setData(candidates);
    setLogs(audit.items);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => {
      window.location.href = '/admin';
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => load().catch(() => undefined), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const source = new EventSource(apiUrl('/api/admin/events'), { withCredentials: true });
    source.addEventListener('application.created', () => {
      setToast('Nova candidatura recebida.');
      load().catch(() => undefined);
    });
    source.addEventListener('application.updated', () => {
      setToast('Candidatura atualizada.');
      load().catch(() => undefined);
    });
    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const cards = useMemo(
    () => [
      ['Pendentes', data.counts.pending || 0],
      ['Aprovados', data.counts.approved || 0],
      ['Reprovados', data.counts.rejected || 0]
    ],
    [data.counts]
  );

  async function decide(decision: CandidateStatus) {
    if (!selected) return;
    const response = await apiFetch<{ candidate: Candidate }>(`/api/admin/candidates/${selected._id}/decision`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, note: decisionNote })
    });
    setSelected(response.candidate);
    setDecisionNote('');
    setToast(decision === 'approved' ? 'Candidato aprovado.' : 'Candidato reprovado.');
    await load();
  }

  async function logout() {
    await apiFetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-indigo-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Recrutamento Fluxo Store</h1>
            <p className="mt-1 text-sm text-slate-500">Logado como {admin?.name || 'Admin'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`${API_URL}/api/admin/candidates.csv?status=${filter}`} className="btn-secondary text-sm"><Download size={16} /> CSV</a>
            <button onClick={() => load()} className="btn-secondary text-sm"><RefreshCw size={16} /> Atualizar</button>
            <button onClick={logout} className="btn-primary text-sm"><LogOut size={16} /> Sair</button>
          </div>
        </header>

        {toast && <div className="fixed right-5 top-5 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl dark:bg-white dark:text-slate-950">{toast}</div>}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {cards.map(([title, value]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold text-slate-500">{title}</p>
              <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as Filter[]).map((item) => (
                  <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-black ${filter === item ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{filterLabels[item]}</button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input className="input pl-10" placeholder="Buscar candidato..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-5 text-slate-500" colSpan={4}>Carregando...</td></tr>
                  ) : data.items.length ? data.items.map((candidate) => (
                    <tr key={candidate._id} onClick={() => setSelected(candidate)} className="cursor-pointer border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-black text-slate-950 dark:text-white">{candidate.fullName}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{candidate.email}</td>
                      <td className="p-4 text-slate-500">{new Date(candidate.submittedAt).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4"><StatusBadge status={candidate.status} /></td>
                    </tr>
                  )) : (
                    <tr><td className="p-5 text-slate-500" colSpan={4}>Nenhum candidato encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Logs recentes</h2>
            <div className="mt-4 grid gap-3">
              {logs.map((log) => (
                <div key={log._id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-sm font-black text-slate-800 dark:text-white">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.adminName} • {new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              ))}
              {!logs.length && <p className="text-sm text-slate-500">Sem logs ainda.</p>}
            </div>
          </aside>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="ml-auto h-full max-w-2xl overflow-auto rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-950 dark:text-white">{selected.fullName}</h2>
                <p className="mt-1 text-slate-500">{selected.discordUsername} • {selected.email}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="mt-6 grid gap-4">
              <Info title="Idade" text={String(selected.age)} />
              <Info title="Experiência anterior" text={selected.experience} />
              <Info title="Motivação" text={selected.motivation} />
              <Info title="Links úteis" text={selected.links || 'Não informado'} />
              {selected.reviewNote && <Info title="Observação da análise" text={selected.reviewNote} />}
            </div>

            <div className="mt-6">
              <h3 className="font-black text-slate-950 dark:text-white">Histórico</h3>
              <div className="mt-3 grid gap-2">
                {(selected.history || []).map((item, index) => (
                  <div key={index} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
                    <p className="font-black text-slate-800 dark:text-white">{item.action} {item.to ? `→ ${item.to}` : ''}</p>
                    <p className="text-slate-500">{item.byName || 'Sistema'} • {new Date(item.at).toLocaleString('pt-BR')}</p>
                    {item.note && <p className="mt-1 text-slate-600 dark:text-slate-300">{item.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {selected.status === 'pending' && (
              <div className="mt-6 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  Observação opcional
                  <textarea className="input min-h-24" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
                </label>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button onClick={() => decide('approved')} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700">Aprovar</button>
                  <button onClick={() => decide('rejected')} className="rounded-full bg-rose-600 px-5 py-3 font-black text-white hover:bg-rose-700">Reprovar</button>
                </div>
              </div>
            )}

            <button onClick={() => setSelected(null)} className="btn-secondary mt-6 w-full">Fechar</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">{text}</p>
    </div>
  );
}
