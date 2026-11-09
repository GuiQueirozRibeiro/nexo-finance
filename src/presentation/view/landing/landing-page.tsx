'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Lock, QrCode, Sparkles } from 'lucide-react';
import {
  BarraProgresso,
  Grupo,
  Item,
  Revelar,
} from '../components/motion-primitives';
import { NexoNavbar } from '../components/nexo-navbar';

export function LandingPage() {
  return (
    <div className="min-h-screen nexo-page flex flex-col">
      <BarraProgresso />
      <NexoNavbar />

      <main className="flex-1">
        {/* HERO MINIMALISTA — Inspirado em The Key Club & Nubank */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <Revelar>
            <div className="inline-flex items-center gap-2 rounded-full nexo-elevated px-3.5 py-1 text-[11px] tracking-[0.2em] uppercase nexo-text-secondary mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" />
              <span>Open Finance • PIX • Inteligência</span>
            </div>
          </Revelar>

          <Revelar atraso={0.06}>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
              Todas as suas contas em um único lugar.{' '}
              <span className="text-[#ff5500]">Sem ruído.</span>
            </h1>
          </Revelar>

          <Revelar atraso={0.12}>
            <p className="text-base sm:text-lg nexo-text-secondary max-w-xl mx-auto leading-relaxed mb-10">
              Conecte seus bancos via Open Finance, envie e receba PIX em poucos
              passos e receba alertas claros sobre cobranças duplicadas e
              assinaturas.
            </p>
          </Revelar>

          <Revelar atraso={0.18}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-7 py-3.5 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                <span>Entrar na minha conta</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 rounded-full nexo-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-[#ff5500]/50"
              >
                <span>Explorar o Portal</span>
                <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
              </Link>
            </div>
          </Revelar>
        </section>

        {/* PREVIEW MINIMALISTA DO CARTÃO / PORTAL */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-28">
          <Revelar atraso={0.1}>
            <div className="rounded-3xl nexo-card p-6 sm:p-10 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] nexo-text-muted block mb-2">
                    Patrimônio Consolidado
                  </span>
                  <div className="font-heading text-3xl sm:text-4xl tracking-tight">
                    R$ 49.490,75
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs nexo-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-[#ff5500]" />
                  <span>4 instituições sincronizadas</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
                <div className="rounded-2xl nexo-elevated p-5">
                  <span className="text-xs nexo-text-muted block mb-1">
                    Nubank • Itaú • Inter • Asaas
                  </span>
                  <p className="text-sm font-medium">
                    Saldos unificados em tempo real
                  </p>
                </div>
                <div className="rounded-2xl nexo-elevated p-5">
                  <span className="text-xs nexo-text-muted block mb-1">
                    Fluxo Guiado
                  </span>
                  <p className="text-sm font-medium">
                    PIX e lançamentos passo a passo
                  </p>
                </div>
                <div className="rounded-2xl nexo-elevated p-5">
                  <span className="text-xs text-[#ff5500] block mb-1">
                    Radar Automático
                  </span>
                  <p className="text-sm font-medium">
                    1 cobrança duplicada detectada
                  </p>
                </div>
              </div>
            </div>
          </Revelar>
        </section>

        {/* 3 PILARES ESSENCIAIS — Layout Editorial Limpo */}
        <section className="border-t border-[var(--border-subtle)] py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <Revelar>
              <div className="max-w-xl mb-14">
                <span className="text-xs uppercase tracking-[0.2em] text-[#ff5500] block mb-2">
                  Experiência Direta
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl tracking-tight">
                  Desenhado para clareza.
                </h2>
              </div>
            </Revelar>

            <Grupo className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <QrCode className="h-4 w-4 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    PIX em Passos Simples
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    Nada de formulários extensos. Escolha o valor, informe a
                    chave e confirme em um fluxo guiado passo a passo.
                  </p>
                </div>
              </Item>

              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <Sparkles className="h-4 w-4 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    Auditoria Silenciosa
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    O motor analisa suas faturas em segundo plano e avisa apenas
                    quando encontra assinaturas duplicadas ou desvios de meta.
                  </p>
                </div>
              </Item>

              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <Lock className="h-4 w-4 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    Controle de Consentimento
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    Gerencie quais instituições permanecem conectadas via Open
                    Finance e revogue permissões com um toque.
                  </p>
                </div>
              </Item>
            </Grupo>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <Revelar>
              <h2 className="font-heading text-2xl sm:text-3xl mb-4">
                Pronto para acessar seu portal?
              </h2>
              <p className="text-sm sm:text-base nexo-text-secondary mb-8">
                Entre com sua conta Firebase ou utilize o acesso instantâneo de
                demonstração.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs nexo-text-secondary mb-8">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                  Autenticação Firebase
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                  Sincronização Cloud Firestore
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                  Clean Architecture & SOLID
                </span>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>Acessar agora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Revelar>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs nexo-text-muted">
          <span>NEXO • Exímia Tech</span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#ff5500] transition-colors">
              Login
            </Link>
            <Link href="/portal" className="hover:text-[#ff5500] transition-colors">
              Portal
            </Link>
            <Link
              href="/arquitetura"
              className="hover:text-[#ff5500] transition-colors"
            >
              Arquitetura TS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
