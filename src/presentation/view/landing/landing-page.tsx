'use client';

import Link from 'next/link';
import { MotionConfig } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Layers,
  Lock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  BarraProgresso,
  ESTOURAR,
  Grupo,
  Item,
  Revelar,
  SUBIR,
} from '../components/motion-primitives';
import { NexoNavbar } from '../components/nexo-navbar';

const PILLARS = [
  {
    icon: RefreshCw,
    badge: 'Open Finance Brasil',
    title: 'Visão Unificada Multi-Bancos',
    description:
      'Sincronize saldos e transações de Nubank, Itaú, Inter e Asaas com controle granular de consentimento e revogação instantânea.',
    accent: '#0df0b2',
  },
  {
    icon: Bot,
    badge: 'Inspirado no Pierre Finance',
    title: 'Assistente Financeiro Inteligente',
    description:
      'Motor determinístico tipado que rastreia assinaturas recorrentes, detecta cobranças duplicadas e responde perguntas sobre seu fluxo de caixa.',
    accent: '#004fff',
  },
  {
    icon: QrCode,
    badge: 'Gateway PIX Asaas & Sandbox',
    title: 'Conta Digital & Liquidação PIX',
    description:
      'Emissão de QR Code PIX EMV (Copia e Cola) e transferências com validação exaustiva de chaves (CPF, E-mail, Celular e EVP) em Flavors DEV/PROD.',
    accent: '#ef5000',
  },
] as const;

const ARCHITECTURE_LAYERS = [
  {
    layer: '01 • Core Layer (src/core/)',
    summary:
      'Mônada funcional Either<L, R>, hierarquia polimórfica de Failure, IUseCase<Success, Params>, Enums, Type Guards para unknown, Mapped & Conditional Types e FlavorConfig.',
    reference: 'Inspirado em App_Nasa/core',
  },
  {
    layer: '02 • Domain Layer (src/domain/)',
    summary:
      'Entidades OOP com encapsulamento (private, protected, readonly, static), Tuplas financeiras ([banco, agencia, conta], [metaIdeal, tetoMaximo]), interfaces SOLID e UseCases.',
    reference: '100% TypeScript puro (zero UI)',
  },
  {
    layer: '03 • Data Layer (src/data/)',
    summary:
      'Models que estendem Entities com fromUnknown (zero any), toJson, copyWith (...spread), cache persistente e integração com o Route Handler /api/asaas/pix.',
    reference: 'Inspirado em MediaModel & MediaRepositoryImpl',
  },
  {
    layer: '04 • Presentation MVVM (src/presentation/)',
    summary:
      'FinanceViewModel reativo desacoplado de framework consumindo UseCases, conectado a Views declarativas em React 19, Next.js App Router e Motion.',
    reference: 'Inspirado em MediaProvider + Batida em Movimento',
  },
] as const;

export function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#050a0b] text-white">
        <BarraProgresso />
        <NexoNavbar />

        <main>
          {/* HERO SECTION */}
          <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#185054]/40">
            <div
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, rgba(24,80,84,0.55), transparent 50%), radial-gradient(circle at 80% 10%, rgba(13,240,178,0.16), transparent 45%)',
              }}
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7">
                  <Revelar y={20}>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#0df0b2]/35 bg-[#185054]/30 px-3.5 py-1.5 text-xs font-medium text-[#0df0b2] mb-6">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>
                        Open Finance + Assistente IA + PIX Asaas • Clean Architecture TS
                      </span>
                    </div>
                  </Revelar>

                  <Revelar atraso={0.08}>
                    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-white mb-6">
                      Controle financeiro inteligente com{' '}
                      <span className="text-[#0df0b2]">precisão de tipos</span>.
                    </h1>
                  </Revelar>

                  <Revelar atraso={0.16}>
                    <p className="text-base sm:text-lg text-[#b6c8c6] leading-relaxed max-w-2xl mb-8">
                      O <strong>Nexo Finance</strong> une a inteligência de análise de gastos e
                      detecção de anomalias estilo <strong>Pierre</strong> à liquidação instantânea{' '}
                      <strong>PIX via Asaas</strong>, construído sobre uma arquitetura em 3 camadas
                      (<strong>Core, Domain, Data e MVVM</strong>) e os princípios{' '}
                      <strong>SOLID</strong>.
                    </p>
                  </Revelar>

                  <Revelar atraso={0.24}>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href="/app"
                        className="inline-flex items-center gap-2.5 rounded-xl bg-[#0df0b2] px-6 py-3.5 text-sm font-bold tracking-wider text-black transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(13,240,178,0.35)]"
                      >
                        ACESSAR PAINEL FINANCEIRO
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/arquitetura"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#185054] bg-[#185054]/20 px-5 py-3.5 text-sm font-medium text-[#b6c8c6] transition-all hover:border-[#0df0b2]/50 hover:text-white"
                      >
                        <Code2 className="h-4 w-4 text-[#0df0b2]" />
                        INSPECIONAR RUBRICA TS (16 ITENS)
                      </Link>
                    </div>
                  </Revelar>

                  <Revelar atraso={0.32}>
                    <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#185054]/40 pt-6 max-w-xl">
                      <div>
                        <span className="font-heading text-xl text-[#0df0b2] block">
                          100%
                        </span>
                        <span className="text-xs text-[#859a9b]">
                          Strict TS (Zero <code>any</code>)
                        </span>
                      </div>
                      <div>
                        <span className="font-heading text-xl text-white block">
                          SOLID
                        </span>
                        <span className="text-xs text-[#859a9b]">
                          Core • Domain • Data • MVVM
                        </span>
                      </div>
                      <div>
                        <span className="font-heading text-xl text-[#0df0b2] block">
                          DEV / PROD
                        </span>
                        <span className="text-xs text-[#859a9b]">
                          Flavors Sandbox &amp; Asaas
                        </span>
                      </div>
                    </div>
                  </Revelar>
                </div>

                {/* INTERACTIVE PREVIEW CARD */}
                <div className="lg:col-span-5">
                  <Revelar atraso={0.2} y={32}>
                    <div className="rounded-2xl border border-[#185054]/80 bg-gradient-to-b from-[#0d1f22]/90 to-[#060d0e]/95 p-6 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-[#185054]/50 pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src="/EXIMIA-LOGO5-C.png"
                            alt="Nexo X"
                            className="h-5 w-5 object-contain"
                          />
                          <span className="font-heading text-xs tracking-widest text-white">
                            PATRIMÔNIO OPEN FINANCE
                          </span>
                        </div>
                        <span className="rounded-full bg-[#0df0b2]/15 border border-[#0df0b2]/40 px-2.5 py-0.5 text-[11px] font-medium text-[#0df0b2]">
                          4 Bancos Ativos
                        </span>
                      </div>

                      <div className="mb-6">
                        <span className="text-xs uppercase tracking-wider text-[#859a9b] block mb-1">
                          Saldo Consolidado (Asaas + Nubank + Itaú + Inter)
                        </span>
                        <div className="font-heading text-2xl sm:text-3xl text-white">
                          R$ 48.770,40
                        </div>
                        <span className="text-xs text-[#0df0b2] mt-1 inline-block">
                          +R$ 7.224,70 de fluxo líquido no mês • Poupança: 49,8%
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="rounded-xl border border-[#ef5000]/40 bg-[#ef5000]/10 p-3.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-[#ef5000] mb-1">
                            <span>ALERTA CRÍTICO • PIERRE ENGINE</span>
                            <span>R$ 34,90 x2</span>
                          </div>
                          <p className="text-xs text-[#d9d9d9]">
                            Cobrança duplicada detectada em <strong>Spotify</strong> (Nubank e
                            Itaú no mesmo dia).
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#185054]/70 bg-black/50 p-3.5">
                          <div className="flex items-center justify-between text-xs text-[#8baba6] mb-1">
                            <span>Tupla Bancária Tipada (Asaas PJ)</span>
                            <span className="text-[#0df0b2] font-mono">
                              [&apos;461&apos;, &apos;0001&apos;, &apos;77410-9&apos;]
                            </span>
                          </div>
                          <p className="text-xs text-white font-medium">
                            QR Code PIX EMV &amp; Transferências com validação exaustiva (
                            <code>assertNever</code>)
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/app"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0df0b2]/40 bg-[#185054]/40 py-3 text-xs font-semibold tracking-wider text-[#0df0b2] transition-all hover:bg-[#0df0b2] hover:text-black"
                      >
                        TESTAR SIMULADOR INTERATIVO AGORA
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Revelar>
                </div>
              </div>
            </div>
          </section>

          {/* 3 PILLARS SECTION */}
          <section className="py-20 border-b border-[#185054]/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Revelar className="max-w-3xl mb-12">
                <span className="font-heading text-xs tracking-[0.3em] text-[#0df0b2] uppercase block mb-2">
                  Domínio e Regras de Negócio
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-white mb-3">
                  A inteligência do Pierre somada ao PIX do Asaas
                </h2>
                <p className="text-[#b6c8c6] text-base">
                  Cada funcionalidade foi modelada para exercitar contratos estritos, classes
                  orientadas a objetos, tuplas imutáveis e tratamento funcional de erros em
                  TypeScript.
                </p>
              </Revelar>

              <Grupo className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <Item key={pillar.title} variants={ESTOURAR}>
                      <div className="h-full rounded-2xl border border-[#185054]/60 bg-[#0a1416]/90 p-6 transition-all hover:border-[#0df0b2]/50">
                        <div className="flex items-center justify-between mb-5">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#185054] bg-black"
                            style={{ color: pillar.accent }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full border border-[#185054] bg-[#185054]/20 px-3 py-1 text-[11px] text-[#b6c8c6]">
                            {pillar.badge}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg text-white mb-2.5">
                          {pillar.title}
                        </h3>
                        <p className="text-sm text-[#b6c8c6] leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </Item>
                  );
                })}
              </Grupo>
            </div>
          </section>

          {/* CLEAN ARCHITECTURE + SOLID SECTION */}
          <section className="py-20 bg-[#071012]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <Revelar className="lg:col-span-5">
                  <span className="font-heading text-xs tracking-[0.3em] text-[#0df0b2] uppercase block mb-2">
                    Engenharia de Software
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl text-white mb-4">
                    Arquitetura Limpa inspirada no <code>App_Nasa</code>
                  </h2>
                  <p className="text-sm sm:text-base text-[#b6c8c6] leading-relaxed mb-6">
                    Seguindo o mesmo padrão de excelência aplicado em nossos projetos Flutter, o{' '}
                    <strong>Nexo Finance</strong> separa rigorosamente contratos de domínio,
                    fontes de dados e estado de apresentação, permitindo transpilar todo o núcleo
                    com <code>npm run build:core</code> e Source Maps nativos.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      'Either<Failure, Success> para fluxo sem exceções não tratadas',
                      'Classes OOP com private, protected, readonly, static e override',
                      'Zero uso de any (validado por ESLint) + Type Guards para unknown',
                      'Mapped Types, Conditional Types, keyof, typeof e assertNever',
                    ].map((point) => (
                      <div key={point} className="flex items-start gap-2.5 text-sm text-[#d9d9d9]">
                        <CheckCircle2 className="h-4 w-4 text-[#0df0b2] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/arquitetura"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#185054] px-5 py-3 text-xs font-semibold tracking-wider text-white transition-all hover:bg-[#0df0b2] hover:text-black"
                    >
                      <Layers className="h-4 w-4" />
                      VER LABORATÓRIO DA RUBRICA
                    </Link>
                    <Link
                      href="/app"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#0df0b2]/40 px-5 py-3 text-xs font-semibold tracking-wider text-[#0df0b2] transition-all hover:bg-[#0df0b2]/10"
                    >
                      <Wallet className="h-4 w-4" />
                      ABRIR DASHBOARD
                    </Link>
                  </div>
                </Revelar>

                <Grupo className="lg:col-span-7 space-y-4">
                  {ARCHITECTURE_LAYERS.map((item) => (
                    <Item key={item.layer} variants={SUBIR}>
                      <div className="rounded-xl border border-[#185054]/60 bg-black/60 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h3 className="font-heading text-sm text-[#0df0b2]">
                            {item.layer}
                          </h3>
                          <span className="text-xs font-mono text-[#859a9b]">
                            {item.reference}
                          </span>
                        </div>
                        <p className="text-sm text-[#b6c8c6] leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                    </Item>
                  ))}
                </Grupo>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#185054]/40 bg-black py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#859a9b]">
            <div className="flex items-center gap-2">
              <img
                src="/EXIMIA-LOGO5-C.png"
                alt="Exímia Tech"
                className="h-4 w-auto object-contain"
              />
              <span>
                Nexo Finance by <strong>Exímia Tech</strong> • Guilherme Queiroz Ribeiro
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-[#0df0b2]">
                <ShieldCheck className="h-3.5 w-3.5" />
                TypeScript para Desenvolvimento Front-end [26E4_2]
              </span>
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                Clean Architecture &amp; SOLID
              </span>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
