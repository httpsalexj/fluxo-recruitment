import { ArrowRight, BadgeCheck, Lock, MessagesSquare, Shield, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { discordLoginUrl } from '../api/client';

export function Landing() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_32%),linear-gradient(180deg,#fff,#f8fafc)] dark:bg-[radial-gradient(circle_at_top_left,#312e81,transparent_30%),linear-gradient(180deg,#020617,#0f172a)]">
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-white/75 px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
            <Sparkles size={16} /> Recrutamento oficial aberto
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
            Faça parte da equipe da <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Fluxo Store</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Buscamos pessoas responsáveis, comunicativas e comprometidas para apoiar nossa comunidade no Discord, atendimento e organização interna.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link to="/apply" className="btn-primary">Preencher candidatura <ArrowRight size={18} /></Link>
            ) : (
              <a href={discordLoginUrl()} className="btn-primary">Entrar com Discord <ArrowRight size={18} /></a>
            )}
            <a href="#vaga" className="btn-secondary">Ver detalhes da vaga</a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-8 top-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="glass relative rounded-[2rem] p-6 shadow-2xl shadow-indigo-950/10">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-300 dark:text-indigo-600">Processo seletivo</p>
              <h2 className="mt-4 text-3xl font-black">Transparente, rápido e organizado.</h2>
              <div className="mt-8 grid gap-4">
                {[
                  ['Login seguro', 'Acesse com sua conta Discord para validar identidade.'],
                  ['Formulário completo', 'Conte sua experiência, disponibilidade e links úteis.'],
                  ['Análise interna', 'A equipe avalia no painel admin com logs e histórico.'],
                  ['Resposta privada', 'Receba o retorno por DM e email.']
                ].map(([title, desc], index) => (
                  <div key={title} className="flex gap-4 rounded-2xl bg-white/10 p-4 dark:bg-slate-950/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-black text-white">{index + 1}</span>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="text-sm opacity-75">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vaga" className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [Users, 'Perfil ideal', 'Boa comunicação, maturidade, responsabilidade e presença ativa no Discord.'],
            [MessagesSquare, 'Atendimento', 'Ajudar membros, orientar compras, responder dúvidas e manter a experiência profissional.'],
            [Shield, 'Confiança', 'Processo com login Discord, histórico de análise e painel protegido.']
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Icon className="mb-5 text-indigo-600" size={28} />
              <h3 className="text-xl font-black text-slate-950 dark:text-white">{String(title)}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{String(text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/10 dark:bg-white dark:text-slate-950 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-emerald-300 dark:text-emerald-700"><BadgeCheck size={20} /> <span className="font-black">Candidatura profissional</span></div>
              <h2 className="text-3xl font-black md:text-4xl">Pronto para tentar uma vaga?</h2>
              <p className="mt-3 max-w-2xl opacity-75">Preencha com atenção. Respostas claras e completas ajudam a equipe a avaliar melhor seu perfil.</p>
            </div>
            {user ? <Link to="/apply" className="btn-primary dark:bg-slate-950 dark:text-white">Começar agora</Link> : <a href={discordLoginUrl()} className="btn-primary dark:bg-slate-950 dark:text-white">Login com Discord</a>}
          </div>
        </div>
      </section>
    </main>
  );
}
