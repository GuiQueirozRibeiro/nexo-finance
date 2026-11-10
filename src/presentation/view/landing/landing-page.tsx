'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
        {/* HERO ULTRAWIDE & MOBILE RESPONSIVO */}
        <section className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-14 xl:px-20 pt-12 pb-16 sm:pt-20 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
            {/* Coluna Esquerda: Proposta de Valor */}
            <div className="lg:col-span-7 space-y-6">
              <Revelar>
                <div className="inline-flex items-center gap-2 rounded-full nexo-elevated px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase nexo-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-[#ff5500]" />
                  <span>Banco Digital • Open Finance BACEN • PIX Asaas</span>
                </div>
              </Revelar>

              <Revelar atraso={0.06}>
                <h1 className="font-heading text-3xl sm:text-5xl xl:text-6xl tracking-tight leading-[1.1] max-w-4xl">
                  Sua conta bancária e todas as suas instituições em um único
                  lugar.{' '}
                  <span className="text-[#ff5500]">Sem ruído.</span>
                </h1>
              </Revelar>

              <Revelar atraso={0.12}>
                <p className="text-base sm:text-lg xl:text-xl nexo-text-secondary max-w-2xl leading-relaxed">
                  Abra sua conta PF ou PJ com validação KYC completa, conecte
                  seus bancos via Open Finance Brasil, emita cobranças QR Code
                  PIX com liquidação instantânea via Asaas BaaS e audite seus
                  centros de custo em tempo real.
                </p>
              </Revelar>

              <Revelar atraso={0.18}>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/login?mode=register"
                    className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-7 py-4 text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    <span>Abrir minha conta</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full nexo-card px-7 py-4 text-sm font-medium transition-colors hover:border-[#ff5500]/50"
                  >
                    <span>Acessar minha conta</span>
                    <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
                  </Link>
                </div>
              </Revelar>

              <Revelar atraso={0.22}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--border-subtle)] text-xs nexo-text-secondary">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#ff5500] shrink-0" />
                    <span>Resolução BCB nº 142/2021</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#ff5500] shrink-0" />
                    <span>28+ Bancos no Open Finance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-[#ff5500] shrink-0" />
                    <span>Webhooks PIX em Tempo Real</span>
                  </div>
                </div>
              </Revelar>
            </div>

            {/* Coluna Direita: Cockpit Bancário em Escala Real */}
            <div className="lg:col-span-5">
              <Revelar atraso={0.1}>
                <div className="rounded-3xl nexo-card p-6 sm:p-9 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#ff5500] font-medium block mb-1">
                        Conta Titular Nexo • Asaas BaaS
                      </span>
                      <div className="font-heading text-2xl sm:text-3xl tracking-tight">
                        Agência 0001 • Conta 1001-0
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-3 py-1 text-xs font-medium">
                      KYC Verificado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-2xl nexo-elevated p-4 space-y-1">
                      <span className="text-xs nexo-text-muted block">
                        Liquidação PIX BaaS
                      </span>
                      <p className="text-sm font-medium">
                        QR Code EMV e Webhooks com trava de idempotência
                      </p>
                    </div>
                    <div className="rounded-2xl nexo-elevated p-4 space-y-1">
                      <span className="text-xs nexo-text-muted block">
                        Open Finance Ativo
                      </span>
                      <p className="text-sm font-medium">
                        Santander, Nubank, Itaú, Inter, Bradesco e BTG
                      </p>
                    </div>
                    <div className="rounded-2xl nexo-elevated p-4 space-y-1">
                      <span className="text-xs nexo-text-muted block">
                        Conformidade Fiscal
                      </span>
                      <p className="text-sm font-medium">
                        Exportação Contábil OFX 1.02 e CSV
                      </p>
                    </div>
                    <div className="rounded-2xl nexo-elevated p-4 space-y-1">
                      <span className="text-xs text-[#ff5500] block">
                        Segurança Biométrica
                      </span>
                      <p className="text-sm font-medium">
                        Validação de CPF/CNPJ, Prova de Vida e PIN 4 dígitos
                      </p>
                    </div>
                  </div>
                </div>
              </Revelar>
            </div>
          </div>
        </section>

        {/* 4 PILARES DE ARQUITETURA BANCÁRIA (PREENCHE MONITORES ULTRAWIDE) */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-14 xl:px-20">
            <Revelar>
              <div className="max-w-2xl mb-12">
                <span className="text-xs uppercase tracking-[0.2em] text-[#ff5500] block mb-2">
                  Engenharia Bancária em Telas Dedicadas
                </span>
                <h2 className="font-heading text-2xl sm:text-4xl tracking-tight">
                  Desenhado para telas mobile, notebooks e monitores Ultrawide.
                </h2>
              </div>
            </Revelar>

            <Grupo className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-11 w-11 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <QrCode className="h-5 w-5 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    PIX Asaas em Página Completa
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    Sem janelas modais apertadas. Transfira ou gere QR Codes PIX
                    reais com preenchimento automático de casas decimais (0,00).
                  </p>
                </div>
              </Item>

              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-11 w-11 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <Building2 className="h-5 w-5 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    Open Finance Direto e Instantâneo
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    Conecte Santander, Nubank, Itaú, Inter, Bradesco, Caixa e
                    BTG com autorização imediata de escopos BACEN e saldo ativo.
                  </p>
                </div>
              </Item>

              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-11 w-11 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <Sparkles className="h-5 w-5 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    Auditoria e Centros de Custo
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    Acompanhe 6 tabelas relacionais sincronizadas no Cloud
                    Firestore com detecção de anomalias e exportação OFX 1.02.
                  </p>
                </div>
              </Item>

              <Item className="rounded-3xl nexo-card p-7 flex flex-col justify-between">
                <div>
                  <div className="h-11 w-11 rounded-2xl nexo-elevated flex items-center justify-center mb-6">
                    <Lock className="h-5 w-5 text-[#ff5500]" />
                  </div>
                  <h3 className="font-heading text-base mb-2.5">
                    Onboarding KYC e Biometria
                  </h3>
                  <p className="text-sm nexo-text-secondary leading-relaxed">
                    Validação matemática de CPF/CNPJ, verificação de documento
                    com prova de vida facial e política estrita contra senhas
                    fracas.
                  </p>
                </div>
              </Item>
            </Grupo>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-14 xl:px-20 text-center">
            <Revelar>
              <h2 className="font-heading text-2xl sm:text-4xl mb-4">
                Abra sua conta digital Nexo com saldo real
              </h2>
              <p className="text-sm sm:text-base nexo-text-secondary max-w-xl mx-auto mb-8">
                Conta 100% individual, iniciando zerada (R$ 0,00) e conectada ao
                Cloud Firestore e Asaas PIX BaaS.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs nexo-text-secondary mb-8">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                  KYC CPF/CNPJ e Prova de Vida
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                  Sincronização Cloud Firestore
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                  Clean Architecture + BFF Mobile
                </span>
              </div>
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-8 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>Criar minha conta agora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Revelar>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-8">
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-14 xl:px-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs nexo-text-muted">
          <span>NEXO BANK • Exímia Tech Soluções Financeiras</span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#ff5500] transition-colors">
              Acessar Conta
            </Link>
            <Link href="/portal" className="hover:text-[#ff5500] transition-colors">
              Portal Bancário
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
