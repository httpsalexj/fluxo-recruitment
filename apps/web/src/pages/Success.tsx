import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function Success() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
      <div className="max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
        <h1 className="mt-5 text-4xl font-black text-slate-950 dark:text-white">Candidatura enviada!</h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
          Recebemos seu formulário. Você receberá uma confirmação por email e a equipe da Fluxo Store fará a análise pelo painel admin.
        </p>
        <Link to="/" className="btn-primary mt-6">Voltar ao início</Link>
      </div>
    </main>
  );
}
