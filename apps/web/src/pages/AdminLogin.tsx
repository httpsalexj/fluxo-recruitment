import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { apiFetch } from '../api/client';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950"><Lock size={24} /></div>
          <h1 className="mt-5 text-3xl font-black text-white">Painel Admin</h1>
          <p className="mt-2 text-sm text-slate-300">Acesso protegido • Fluxo Store</p>
        </div>
        <div className="grid gap-4">
          <input className="input" type="email" placeholder="Email admin" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        {error && <div className="mt-4 rounded-2xl bg-rose-500/10 p-3 text-sm font-bold text-rose-200">{error}</div>}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-white px-5 py-3 font-black text-slate-950 transition hover:scale-[1.01] disabled:opacity-60">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
