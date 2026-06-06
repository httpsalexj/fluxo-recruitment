import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { apiFetch } from '../api/client';
import type { Candidate } from '../types';

export function Apply() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<Candidate | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    age: '',
    experience: '',
    motivation: '',
    links: ''
  });

  useEffect(() => {
    if (!user) return;
    setForm((value) => ({ ...value, email: user.email || '' }));
    apiFetch<{ application: Candidate | null }>('/api/applications/me')
      .then((data) => setExisting(data.application))
      .finally(() => setChecking(false));
  }, [user]);

  if (loading) return <div className="min-h-screen p-10 text-slate-600 dark:text-slate-300">Carregando...</div>;
  if (!user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify({ ...form, age: Number(form.age) })
      });
      navigate('/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return <div className="min-h-screen p-10 text-slate-600 dark:text-slate-300">Verificando candidatura...</div>;

  if (existing) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">Você já possui uma candidatura</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Status atual: <strong>{existing.status}</strong></p>
          <p className="mt-2 text-sm text-slate-500">Enviada em {new Date(existing.submittedAt).toLocaleString('pt-BR')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-indigo-600">Candidatura</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Conte um pouco sobre você</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Logado como Discord: <strong>{user.globalName || user.username}</strong></p>
        </div>

        <form onSubmit={onSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              Nome completo
              <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required minLength={3} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              Email
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              Idade
              <input type="number" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} min={13} max={99} required />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              Links úteis
              <input className="input" value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} placeholder="Portfolio, GitHub, redes, etc." />
            </label>
          </div>

          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              Experiência anterior
              <textarea className="input min-h-36 resize-y" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required minLength={20} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              Por que quer trabalhar conosco?
              <textarea className="input min-h-36 resize-y" value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} required minLength={20} />
            </label>
          </div>

          {error && <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}

          <button disabled={submitting} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
            <Send size={18} /> {submitting ? 'Enviando...' : 'Enviar candidatura'}
          </button>
        </form>
      </div>
    </main>
  );
}
