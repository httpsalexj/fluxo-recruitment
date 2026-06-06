import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { discordLoginUrl } from '../api/client';

export function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white dark:bg-white dark:text-slate-950">F</div>
          <div>
            <p className="font-black tracking-tight text-slate-950 dark:text-white">Fluxo Store</p>
            <p className="text-xs font-medium text-slate-500">Recrutamento oficial</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <button onClick={() => setDark((value) => !value)} className="rounded-full border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-200" aria-label="Alternar tema">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/admin" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white md:inline-flex">Admin</Link>
          {user ? (
            <button onClick={logout} className="btn-secondary text-sm">Sair</button>
          ) : (
            <a href={discordLoginUrl()} className="btn-primary text-sm">Entrar com Discord</a>
          )}
        </nav>
      </div>
    </header>
  );
}
