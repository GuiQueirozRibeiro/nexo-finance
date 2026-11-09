'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { FirebaseClientManager } from '@/core';
import { NexoNavbar } from '../components/nexo-navbar';

type AuthMode = 'login' | 'register';
type WizardStep = 1 | 2;

export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'register') {
        return 'register';
      }
    }
    return 'login';
  });
  const [step, setStep] = useState<WizardStep>(1);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = FirebaseClientManager.subscribe((user) => {
      if (user) {
        router.replace('/portal');
      }
    });
    return () => unsub();
  }, [router]);

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.includes('@') || email.trim().length < 5) {
      setErrorMsg('Informe um endereço de e-mail válido para continuar.');
      return;
    }
    setStep(2);
  };

  const handleSubmitAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) {
      setErrorMsg('Sua senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result =
      mode === 'login'
        ? await FirebaseClientManager.signInWithEmail(email, password)
        : await FirebaseClientManager.registerWithEmail(name, email, password);
    setLoading(false);

    result.fold(
      (failure) => setErrorMsg(failure.message),
      () => router.push('/portal'),
    );
  };

  const handleInstantDemo = async () => {
    setErrorMsg(null);
    setLoading(true);
    const result = await FirebaseClientManager.signInDemoAccount();
    setLoading(false);

    result.fold(
      (failure) => setErrorMsg(failure.message),
      () => router.push('/portal'),
    );
  };

  return (
    <div className="min-h-screen nexo-page flex flex-col">
      <NexoNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl nexo-card p-7 sm:p-9 shadow-2xl">
          {/* Indicador de Passo (Wizard) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  step >= 1 ? 'bg-[#ff5500]' : 'bg-[var(--border-subtle)]'
                }`}
              />
              <span
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  step >= 2 ? 'bg-[#ff5500]' : 'bg-[var(--border-subtle)]'
                }`}
              />
            </div>
            <span className="text-xs nexo-text-muted">Passo {step} de 2</span>
          </div>

          {/* Seletor Entrar vs Criar Conta */}
          <div className="grid grid-cols-2 rounded-2xl nexo-elevated p-1 mb-7">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep(1);
                setErrorMsg(null);
              }}
              className={`rounded-xl py-2 text-xs font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#ff5500] text-white'
                  : 'nexo-text-secondary'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setStep(1);
                setErrorMsg(null);
              }}
              className={`rounded-xl py-2 text-xs font-medium transition-all ${
                mode === 'register'
                  ? 'bg-[#ff5500] text-white'
                  : 'nexo-text-secondary'
              }`}
            >
              Criar conta
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-[#ff5500]/40 bg-[#ff5500]/10 p-3.5 text-xs text-[#ff5500]">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <h1 className="font-heading text-xl sm:text-2xl mb-1.5">
                  {mode === 'login'
                    ? 'Qual é o seu e-mail?'
                    : 'Vamos criar sua conta'}
                </h1>
                <p className="text-xs nexo-text-secondary">
                  {mode === 'login'
                    ? 'Digite seu e-mail cadastrado para acessar o Portal Nexo.'
                    : 'Informe seu melhor e-mail para começar.'}
                </p>
              </div>

              <div>
                <label className="block text-xs nexo-text-secondary mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com.br"
                  className="w-full rounded-2xl nexo-elevated px-4 py-3.5 text-sm focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => void handleSubmitAuth(e)} className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMsg(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs nexo-text-secondary hover:text-[#ff5500]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar ({email})</span>
              </button>

              <div>
                <h1 className="font-heading text-xl sm:text-2xl mb-1.5">
                  {mode === 'login'
                    ? 'Digite sua senha'
                    : 'Complete seu cadastro'}
                </h1>
                <p className="text-xs nexo-text-secondary">
                  Autenticação segura via Firebase Authentication.
                </p>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs nexo-text-secondary mb-2">
                    Como podemos te chamar?
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-2xl nexo-elevated px-4 py-3.5 text-sm focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs nexo-text-secondary mb-2">
                  Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl nexo-elevated px-4 py-3.5 text-sm focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {loading
                    ? 'Autenticando...'
                    : mode === 'login'
                      ? 'Entrar no Portal'
                      : 'Finalizar e abrir conta'}
                </span>
              </button>
            </form>
          )}

          {/* Divisor para Acesso Rápido de Demonstração */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            <span className="text-[11px] nexo-text-muted uppercase tracking-wider">
              ou
            </span>
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void handleInstantDemo()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full nexo-elevated py-3 text-xs font-medium nexo-text-secondary hover:border-[#ff5500]/50 hover:text-[#ff5500] transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#ff5500]" />
            <span>Entrar com Conta Demo Instantânea (1 clique)</span>
          </button>
        </div>
      </main>
    </div>
  );
}

