'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Check,
  Copy,
  Filter,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  AppFlavor,
  InstitutionCode,
  TransactionCategory,
  getCategoryLabel,
} from '@/core';
import type { PixKeyType, TransactionType } from '@/domain';
import { useFinanceViewModel } from '@/presentation/hooks/use-finance-viewmodel';
import { NexoNavbar } from '../components/nexo-navbar';

const QUICK_PROMPTS = [
  'Tem alguma cobrança duplicada?',
  'Quais são minhas assinaturas recorrentes?',
  'Qual meu saldo consolidado?',
  'Onde mais gastei neste mês?',
] as const;

export function DashboardPage() {
  const { viewModel, state } = useFinanceViewModel();

  // Estados locais de filtro de transações
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    TransactionCategory | 'ALL'
  >('ALL');
  const [selectedInstitution, setSelectedInstitution] = useState<
    InstitutionCode | 'ALL'
  >('ALL');

  // Estados do módulo PIX Asaas
  const [pixTab, setPixTab] = useState<'CHARGE' | 'TRANSFER'>('CHARGE');
  const [chargeAmount, setChargeAmount] = useState('450.00');
  const [chargeDesc, setChargeDesc] = useState('Consultoria Técnica Exímia Tech');
  const [copiedQr, setCopiedQr] = useState(false);

  const [transferRecipient, setTransferRecipient] = useState(
    'Fornecedor Cloud Brasil',
  );
  const [transferKeyType, setTransferKeyType] = useState<PixKeyType>('EMAIL');
  const [transferKey, setTransferKey] = useState('financeiro@parceiro.com.br');
  const [transferAmount, setTransferAmount] = useState('180.00');

  // Estado do Chat Pierre AI
  const [chatInput, setChatInput] = useState('');

  // Estado de Novo Lançamento
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<TransactionType>('EXPENSE');
  const [newTxCategory, setNewTxCategory] = useState<TransactionCategory>(
    TransactionCategory.FOOD,
  );
  const [newTxInstitution, setNewTxInstitution] = useState<InstitutionCode>(
    InstitutionCode.NUBANK,
  );

  const summary = state.summary;

  const handleFilterChange = (
    nextQuery: string,
    nextCat: TransactionCategory | 'ALL',
    nextInst: InstitutionCode | 'ALL',
  ) => {
    setSearchQuery(nextQuery);
    setSelectedCategory(nextCat);
    setSelectedInstitution(nextInst);
    void viewModel.filterTransactions({
      query: nextQuery,
      category: nextCat,
      institution: nextInst,
    });
  };

  const handleCreatePixCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(chargeAmount.replace(',', '.'));
    await viewModel.generatePixQrCode(numeric, chargeDesc);
  };

  const handleExecutePixTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(transferAmount.replace(',', '.'));
    await viewModel.sendPixTransfer({
      sourceAccountId: 'acc-asaas-eximia',
      recipientName: transferRecipient,
      pixKeyType: transferKeyType,
      pixKey: transferKey,
      amount: numeric,
      description: `PIX ${transferKeyType}`,
    });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(newTxAmount.replace(',', '.'));
    const ok = await viewModel.addNewTransaction({
      id: `tx-manual-${Date.now()}`,
      title: newTxTitle,
      amount: numeric,
      type: newTxType,
      category: newTxCategory,
      institution: newTxInstitution,
      dateIso: new Date().toISOString().slice(0, 10),
    });
    if (ok) {
      setNewTxTitle('');
      setNewTxAmount('');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    viewModel.askAssistant(chatInput);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#050a0b] text-white">
      <NexoNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TOP FLAVOR & ENVIRONMENT BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#185054]/70 bg-[#0b1719]/90 p-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-heading text-sm sm:text-base text-white">
                CENTRAL OPEN FINANCE &amp; CONTA DIGITAL PIX
              </span>
              <span className="rounded-full border border-[#0df0b2]/40 bg-[#0df0b2]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0df0b2]">
                Flavor.{state.activeFlavor}
              </span>
            </div>
            <p className="text-xs text-[#8baba6]">
              alterne entre o simulador determinístico (<code>DEV</code>) e o proxy de
              integração Asaas PIX (<code>PROD /api/asaas/pix</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl border border-[#185054] bg-black p-1">
              <button
                type="button"
                onClick={() => viewModel.switchFlavor(AppFlavor.DEV)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  state.activeFlavor === AppFlavor.DEV
                    ? 'bg-[#0df0b2] text-black'
                    : 'text-[#8baba6] hover:text-white'
                }`}
              >
                DEV (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => viewModel.switchFlavor(AppFlavor.PROD)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  state.activeFlavor === AppFlavor.PROD
                    ? 'bg-[#004fff] text-white'
                    : 'text-[#8baba6] hover:text-white'
                }`}
              >
                PROD (Asaas API)
              </button>
            </div>

            <button
              type="button"
              onClick={() => void viewModel.resetDemoData()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#185054] bg-[#185054]/20 px-3 py-2 text-xs text-[#b6c8c6] hover:border-[#0df0b2]/50 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar Seed
            </button>
          </div>
        </div>

        {/* BANNERS DE FEEDBACK / ERRO (Either<Failure, Success>) */}
        {state.errorMessage && (
          <div className="flex items-center justify-between rounded-xl border border-[#ef5000]/60 bg-[#ef5000]/15 px-4 py-3 text-xs sm:text-sm text-white">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-[#ef5000] shrink-0" />
              <span>{state.errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => viewModel.clearNotices()}
              className="text-xs underline text-[#b6c8c6] hover:text-white"
            >
              Fechar
            </button>
          </div>
        )}

        {state.feedbackBanner && (
          <div className="flex items-center justify-between rounded-xl border border-[#0df0b2]/50 bg-[#0df0b2]/10 px-4 py-3 text-xs sm:text-sm text-[#0df0b2]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{state.feedbackBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => viewModel.clearNotices()}
              className="text-xs underline text-[#b6c8c6] hover:text-white"
            >
              OK
            </button>
          </div>
        )}

        {/* KPI CARDS */}
        {summary && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-5">
              <div className="flex items-center justify-between text-xs text-[#859a9b] mb-2">
                <span>PATRIMÔNIO OPEN FINANCE</span>
                <Wallet className="h-4 w-4 text-[#0df0b2]" />
              </div>
              <div className="font-heading text-2xl text-white">
                R${' '}
                {summary.consolidatedBalance.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-[#0df0b2] mt-1 block">
                {summary.authorizedAccountsCount} contas com consentimento ativo
              </span>
            </div>

            <div className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-5">
              <div className="flex items-center justify-between text-xs text-[#859a9b] mb-2">
                <span>ENTRADAS NO MÊS</span>
                <ArrowUpRight className="h-4 w-4 text-[#0df0b2]" />
              </div>
              <div className="font-heading text-2xl text-[#0df0b2]">
                R${' '}
                {summary.totalIncomeMonth.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-[#8baba6] mt-1 block">
                Taxa de poupança: {summary.savingsRatePercentage}%
              </span>
            </div>

            <div className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-5">
              <div className="flex items-center justify-between text-xs text-[#859a9b] mb-2">
                <span>SAÍDAS &amp; PIX NO MÊS</span>
                <ArrowDownRight className="h-4 w-4 text-[#ef5000]" />
              </div>
              <div className="font-heading text-2xl text-white">
                R${' '}
                {summary.totalExpensesMonth.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-[#8baba6] mt-1 block">
                Fluxo líquido: R$ {summary.netCashFlowMonth.toFixed(2)}
              </span>
            </div>

            <div className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-5">
              <div className="flex items-center justify-between text-xs text-[#859a9b] mb-2">
                <span>RADAR DE ASSINATURAS</span>
                <Bot className="h-4 w-4 text-[#004fff]" />
              </div>
              <div className="font-heading text-2xl text-white">
                R${' '}
                {summary.recurringSubscriptionsTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-[#ef5000] mt-1 block">
                {summary.insights.filter((i) => i.severity === 'CRITICAL').length}{' '}
                alerta(s) de duplicidade
              </span>
            </div>
          </section>
        )}

        {/* CONTAS CONECTADAS OPEN FINANCE + PIX ASAAS GATEWAY */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Contas Open Finance */}
          <div className="lg:col-span-7 rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base text-white">
                  Instituições Conectadas (Open Finance)
                </h2>
                <p className="text-xs text-[#8baba6]">
                  Entidades OOP <code>BankAccount</code> com Tupla{' '}
                  <code>readonly [banco, agencia, conta]</code> e controle de
                  consentimento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {state.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`rounded-xl border p-4 transition-all ${
                    acc.isAuthorized
                      ? 'border-[#185054] bg-black/60'
                      : 'border-[#ef5000]/40 bg-black/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">
                      {acc.nickname}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        acc.isAuthorized
                          ? 'bg-[#0df0b2]/15 text-[#0df0b2]'
                          : 'bg-[#ef5000]/20 text-[#ef5000]'
                      }`}
                    >
                      {acc.isAuthorized ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <ShieldAlert className="h-3 w-3" />
                      )}
                      {acc.consentStatus}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-[#859a9b] mb-3">
                    {acc.formattedCoordinates}
                  </p>

                  <div className="font-heading text-lg text-white mb-3">
                    R${' '}
                    {acc.balance.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#185054]/40">
                    <button
                      type="button"
                      disabled={!acc.isAuthorized}
                      onClick={() =>
                        void viewModel.syncInstitution(acc.institution)
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-[#185054]/40 px-2.5 py-1.5 text-[11px] font-medium text-[#0df0b2] hover:bg-[#185054] disabled:opacity-40"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Sincronizar CDI
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void viewModel.toggleAccountConsent(
                          acc.id,
                          !acc.isAuthorized,
                        )
                      }
                      className="ml-auto text-[11px] text-[#8baba6] underline hover:text-white"
                    >
                      {acc.isAuthorized ? 'Revogar acesso' : 'Autorizar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Módulo PIX Asaas */}
          <div className="lg:col-span-5 rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-base text-white">
                  Conta Digital &amp; PIX Asaas
                </h2>
                <p className="text-xs text-[#8baba6]">
                  Gere QR Code PIX de cobrança ou transfira com validação exaustiva.
                </p>
              </div>
              <QrCode className="h-5 w-5 text-[#0df0b2]" />
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-black p-1 border border-[#185054]/60 mb-4">
              <button
                type="button"
                onClick={() => setPixTab('CHARGE')}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  pixTab === 'CHARGE'
                    ? 'bg-[#185054] text-[#0df0b2]'
                    : 'text-[#8baba6] hover:text-white'
                }`}
              >
                Receber (QR Code PIX)
              </button>
              <button
                type="button"
                onClick={() => setPixTab('TRANSFER')}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  pixTab === 'TRANSFER'
                    ? 'bg-[#185054] text-[#0df0b2]'
                    : 'text-[#8baba6] hover:text-white'
                }`}
              >
                Enviar PIX
              </button>
            </div>

            {pixTab === 'CHARGE' ? (
              <form onSubmit={(e) => void handleCreatePixCharge(e)} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Valor da Cobrança (R$)
                  </label>
                  <input
                    type="text"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full rounded-xl border border-[#185054] bg-black px-3.5 py-2 text-sm text-white focus:border-[#0df0b2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Descrição da Cobrança
                  </label>
                  <input
                    type="text"
                    value={chargeDesc}
                    onChange={(e) => setChargeDesc(e.target.value)}
                    className="w-full rounded-xl border border-[#185054] bg-black px-3.5 py-2 text-sm text-white focus:border-[#0df0b2] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0df0b2] py-2.5 text-xs font-bold tracking-wider text-black hover:bg-white transition-all"
                >
                  GERAR QR CODE PIX ({state.activeFlavor})
                </button>

                {state.activePixCharge && (
                  <div className="mt-4 rounded-xl border border-[#0df0b2]/40 bg-black/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#0df0b2] font-semibold">
                        QR Code Ativo ({state.activePixCharge.provider})
                      </span>
                      <span className="text-[#859a9b]">
                        R$ {state.activePixCharge.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] break-all text-[#b6c8c6] bg-[#0a1416] p-2 rounded border border-[#185054]/50">
                      {state.activePixCharge.qrPayload[0]}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && state.activePixCharge) {
                          void navigator.clipboard.writeText(
                            state.activePixCharge.qrPayload[0],
                          );
                          setCopiedQr(true);
                          setTimeout(() => setCopiedQr(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-[#0df0b2] hover:underline"
                    >
                      {copiedQr ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Código PIX copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copiar PIX Copia e Cola
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <form
                onSubmit={(e) => void handleExecutePixTransfer(e)}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-[#b6c8c6] mb-1">
                      Tipo de Chave
                    </label>
                    <select
                      value={transferKeyType}
                      onChange={(e) =>
                        setTransferKeyType(e.target.value as PixKeyType)
                      }
                      className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                    >
                      <option value="EMAIL">E-mail</option>
                      <option value="CPF">CPF</option>
                      <option value="PHONE">Celular</option>
                      <option value="RANDOM">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#b6c8c6] mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="text"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Chave PIX de Destino
                  </label>
                  <input
                    type="text"
                    value={transferKey}
                    onChange={(e) => setTransferKey(e.target.value)}
                    placeholder="Ex: contato@eximiatech.com.br ou 123.456.789-00"
                    className="w-full rounded-xl border border-[#185054] bg-black px-3.5 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Favorecido
                  </label>
                  <input
                    type="text"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full rounded-xl border border-[#185054] bg-black px-3.5 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0df0b2] py-2.5 text-xs font-bold tracking-wider text-black hover:bg-white transition-all"
                >
                  LIQUIDAR TRANSFERÊNCIA PIX
                </button>
              </form>
            )}
          </div>
        </section>

        {/* PIERRE AI INSIGHTS & CONVERSATIONAL ASSISTANT */}
        {summary && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Insights de Gastos e Tuplas de Orçamento */}
            <div className="lg:col-span-6 rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-base text-white">
                    Diagnóstico de Gastos &amp; Anomalias (Pierre Engine)
                  </h2>
                  <p className="text-xs text-[#8baba6]">
                    Comparação automática com a tupla{' '}
                    <code>BudgetThresholdTuple [metaIdeal, tetoAlerta]</code>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {summary.insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-xl border p-3.5 ${
                      insight.severity === 'CRITICAL'
                        ? 'border-[#ef5000]/60 bg-[#ef5000]/10'
                        : insight.severity === 'WARNING'
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-[#185054] bg-black/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white">
                        {insight.title}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          insight.severity === 'CRITICAL'
                            ? 'bg-[#ef5000] text-white'
                            : insight.severity === 'WARNING'
                              ? 'bg-amber-400 text-black'
                              : 'bg-[#0df0b2]/20 text-[#0df0b2]'
                        }`}
                      >
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#d9d9d9] mb-1.5">
                      {insight.description}
                    </p>
                    <p className="text-[11px] text-[#0df0b2]">
                      Recomendação: {insight.actionRecommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Interativo Pierre AI */}
            <div className="lg:col-span-6 rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004fff]/20 border border-[#004fff]/50 text-[#0df0b2]">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm text-white">
                        Converse com seu Dinheiro (Nexo IA)
                      </h2>
                      <span className="text-[11px] text-[#8baba6]">
                        Inspirado na experiência conversacional do Pierre Finance
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => viewModel.askAssistant(prompt)}
                      className="rounded-full border border-[#185054] bg-black px-3 py-1 text-[11px] text-[#b6c8c6] hover:border-[#0df0b2] hover:text-[#0df0b2] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
                  {state.assistantHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'USER'
                          ? 'ml-8 bg-[#185054]/60 text-white border border-[#0df0b2]/30'
                          : 'mr-4 bg-black/80 text-[#d9d9d9] border border-[#185054]/70'
                      }`}
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#0df0b2] mb-1">
                        {msg.sender === 'USER' ? 'Você' : 'Nexo IA • Pierre Engine'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte sobre assinaturas, duplicidades, saldo ou gastos..."
                  className="flex-1 rounded-xl border border-[#185054] bg-black px-3.5 py-2.5 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0df0b2] px-4 py-2.5 text-xs font-bold text-black hover:bg-white transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  Enviar
                </button>
              </form>
            </div>
          </section>
        )}

        {/* EXTRATO CONSOLIDADO & FORMULÁRIO DE NOVO LANÇAMENTO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista de Transações */}
          <div className="lg:col-span-8 rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-base text-white">
                  Extrato Unificado Open Finance
                </h2>
                <p className="text-xs text-[#8baba6]">
                  Pesquisa reativa via <code>SearchTransactionsUseCase</code> (inspirado no{' '}
                  <code>SearchMedia</code> do <code>App_Nasa</code>).
                </p>
              </div>
              <span className="text-xs text-[#0df0b2] font-mono">
                {state.filteredTransactions.length} lançamento(s)
              </span>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-[#859a9b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    handleFilterChange(
                      e.target.value,
                      selectedCategory,
                      selectedInstitution,
                    )
                  }
                  placeholder="Buscar título, loja ou data..."
                  className="w-full rounded-xl border border-[#185054] bg-black pl-8 pr-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                />
              </div>

              <div className="relative">
                <Filter className="h-3.5 w-3.5 text-[#859a9b] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    handleFilterChange(
                      searchQuery,
                      e.target.value as TransactionCategory | 'ALL',
                      selectedInstitution,
                    )
                  }
                  className="w-full rounded-xl border border-[#185054] bg-black pl-8 pr-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                >
                  <option value="ALL">Todas as Categorias</option>
                  {Object.values(TransactionCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedInstitution}
                onChange={(e) =>
                  handleFilterChange(
                    searchQuery,
                    selectedCategory,
                    e.target.value as InstitutionCode | 'ALL',
                  )
                }
                className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
              >
                <option value="ALL">Todos os Bancos</option>
                {Object.values(InstitutionCode).map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabela de lançamentos */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {state.filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-[#185054]/50 bg-black/60 px-4 py-3 hover:border-[#0df0b2]/40 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-white truncate">
                        {tx.title}
                      </span>
                      {tx.isRecurring && (
                        <span className="rounded bg-[#185054]/60 px-1.5 py-0.5 text-[10px] text-[#0df0b2]">
                          Recorrente
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#859a9b] mt-0.5">
                      <span>{tx.institution}</span>
                      <span>•</span>
                      <span>{tx.categoryLabel}</span>
                      <span>•</span>
                      <span>{tx.dateIso}</span>
                    </div>
                  </div>

                  <div
                    className={`font-heading text-xs sm:text-sm shrink-0 ${
                      tx.isIncome ? 'text-[#0df0b2]' : 'text-white'
                    }`}
                  >
                    {tx.isIncome ? '+' : '-'} R${' '}
                    {tx.amount.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Novo Lançamento Manual */}
          <div className="lg:col-span-4 rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-base text-white">
                  Novo Lançamento Tipado
                </h2>
                <p className="text-xs text-[#8baba6]">
                  Validado por <code>Transaction.validateProps()</code> retornando{' '}
                  <code>Either&lt;Failure, Transaction&gt;</code>.
                </p>
              </div>
              <Plus className="h-5 w-5 text-[#0df0b2]" />
            </div>

            <form
              onSubmit={(e) => void handleAddTransaction(e)}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-[#b6c8c6] mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newTxTitle}
                  onChange={(e) => setNewTxTitle(e.target.value)}
                  placeholder="Ex: Licença JetBrains / Recebimento Cliente"
                  className="w-full rounded-xl border border-[#185054] bg-black px-3.5 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Natureza
                  </label>
                  <select
                    value={newTxType}
                    onChange={(e) =>
                      setNewTxType(e.target.value as TransactionType)
                    }
                    className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Categoria (Enum)
                  </label>
                  <select
                    value={newTxCategory}
                    onChange={(e) =>
                      setNewTxCategory(e.target.value as TransactionCategory)
                    }
                    className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                  >
                    {Object.values(TransactionCategory).map((c) => (
                      <option key={c} value={c}>
                        {getCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#b6c8c6] mb-1">
                    Instituição (Enum)
                  </label>
                  <select
                    value={newTxInstitution}
                    onChange={(e) =>
                      setNewTxInstitution(e.target.value as InstitutionCode)
                    }
                    className="w-full rounded-xl border border-[#185054] bg-black px-3 py-2 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
                  >
                    {Object.values(InstitutionCode).map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#185054] py-2.5 text-xs font-bold tracking-wider text-white hover:bg-[#0df0b2] hover:text-black transition-all"
              >
                REGISTRAR LANÇAMENTO
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
