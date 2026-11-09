'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  PieChart,
  Plus,
  QrCode,
  RefreshCw,
  Repeat,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AppFlavor,
  type DeepReadonly,
  FirebaseClientManager,
  InstitutionCode,
  type NexoAuthUser,
  TransactionCategory,
  getCategoryLabel,
  getInstitutionDisplayName,
} from '@/core';
import type { PixKeyType, TransactionType } from '@/domain';
import {
  type FinanceViewState,
  createFinanceViewModel,
} from '@/presentation/viewmodel/finance.viewmodel';
import { NexoNavbar } from '../components/nexo-navbar';

type PortalTab =
  | 'overview'
  | 'statement'
  | 'accounts'
  | 'cards'
  | 'costs'
  | 'subscriptions_pix';

type ActiveWizard =
  | null
  | 'transfer_pix'
  | 'charge_pix'
  | 'new_transaction'
  | 'open_finance'
  | 'card_manage'
  | 'cost_budget'
  | 'new_pix_key'
  | 'assistant';

function formatCurrency(value: number, hidden = false): string {
  if (hidden) {
    return 'R$ ••••••';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function DashboardPage() {
  const viewModel = useMemo(() => createFinanceViewModel(), []);
  const [state, setState] = useState<DeepReadonly<FinanceViewState>>(
    () => viewModel.state,
  );
  const [authUser, setAuthUser] = useState<NexoAuthUser | null>(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');
  const [activeCategory, setActiveCategory] = useState<
    TransactionCategory | 'ALL'
  >('ALL');

  // Estado do Wizard ativo e passo atual
  const [activeWizard, setActiveWizard] = useState<ActiveWizard>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Estado Wizard: Transferir PIX (3 passos)
  const [pixTransferAmount, setPixTransferAmount] = useState('150');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('EMAIL');
  const [pixKeyValue, setPixKeyValue] = useState('fornecedor@eximiatech.com.br');
  const [pixRecipientName, setPixRecipientName] = useState(
    'Exímia Cloud Services',
  );

  // Estado Wizard: Cobrar PIX QR Code (2 passos)
  const [pixChargeAmount, setPixChargeAmount] = useState('250');
  const [pixChargeDesc, setPixChargeDesc] = useState('Consultoria Nexo');
  const [copiedQr, setCopiedQr] = useState(false);

  // Estado Wizard: Novo Lançamento (3 passos)
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [txAmount, setTxAmount] = useState('');
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState<TransactionCategory>(
    TransactionCategory.FOOD,
  );
  const [txInstitution, setTxInstitution] = useState<InstitutionCode>(
    InstitutionCode.NUBANK,
  );

  // Estado Wizard: Open Finance (2 passos)
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  // Estado Wizard: Gerenciar Cartão / Fatura (2 passos)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [newCardLimitInput, setNewCardLimitInput] = useState('30000');

  // Estado Wizard: Editar Meta de Centro de Custo (2 passos)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [budgetIdealInput, setBudgetIdealInput] = useState('1200');
  const [budgetCeilingInput, setBudgetCeilingInput] = useState('1600');

  // Estado Wizard: Cadastrar Chave PIX (2 passos)
  const [newKeyType, setNewKeyType] = useState<PixKeyType>('EMAIL');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyInst, setNewKeyInst] = useState<InstitutionCode>(
    InstitutionCode.ASAAS,
  );

  // Estado Assistente & Busca
  const [chatInput, setChatInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const unsubVm = viewModel.subscribe((next) => setState(next));
    void viewModel.loadDashboard();
    const unsubAuth = FirebaseClientManager.subscribe((user) => {
      setAuthUser(user);
    });
    return () => {
      unsubVm();
      unsubAuth();
    };
  }, [viewModel]);

  const summary = state.summary;
  const userName = authUser?.displayName ?? 'Guilherme';

  const openWizard = (wizard: ActiveWizard) => {
    viewModel.clearNotices();
    setActiveWizard(wizard);
    setWizardStep(1);
  };

  const closeWizard = () => {
    setActiveWizard(null);
    setWizardStep(1);
  };

  const handleConfirmPixTransfer = async () => {
    const asaasAccount =
      state.accounts.find((a) => a.institution === InstitutionCode.ASAAS) ??
      state.accounts[0];
    const ok = await viewModel.sendPixTransfer({
      sourceAccountId: asaasAccount?.id ?? 'acc-asaas',
      amount: Number(pixTransferAmount),
      pixKeyType,
      pixKey: pixKeyValue,
      recipientName: pixRecipientName,
      description: 'Transferência PIX via Portal Nexo',
    });
    if (ok) {
      closeWizard();
    }
  };

  const handleGeneratePixQr = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await viewModel.generatePixQrCode(
      Number(pixChargeAmount),
      pixChargeDesc,
    );
    if (ok) {
      setWizardStep(2);
    }
  };

  const handleCopyQrPayload = async (payload: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(payload);
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
    }
  };

  const handleCreateTransaction = async () => {
    if (!txTitle.trim() || !txAmount) {
      return;
    }
    const ok = await viewModel.addNewTransaction({
      id: `tx-${Date.now()}`,
      title: txTitle.trim(),
      amount: Number(txAmount),
      type: txType,
      category: txCategory,
      institution: txInstitution,
      dateIso: new Date().toISOString().slice(0, 10),
    });
    if (ok) {
      setTxTitle('');
      setTxAmount('');
      closeWizard();
    }
  };

  const handleSaveCostBudget = () => {
    if (!selectedBudgetId) return;
    const ok = viewModel.updateCostCenterThresholds(
      selectedBudgetId,
      Number(budgetIdealInput),
      Number(budgetCeilingInput),
    );
    if (ok) {
      closeWizard();
    }
  };

  const handleRegisterPixKey = () => {
    const ok = viewModel.registerPixKey({
      id: `pk-${Date.now()}`,
      label: newKeyLabel || `Chave ${newKeyType}`,
      keyType: newKeyType,
      keyValue: newKeyValue,
      institution: newKeyInst,
      isPrimary: false,
    });
    if (ok) {
      setNewKeyValue('');
      setNewKeyLabel('');
      closeWizard();
    }
  };

  const handleAskAssistant = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) {
      return;
    }
    viewModel.askAssistant(chatInput);
    setChatInput('');
  };

  const selectedBank =
    state.accounts.find((a) => a.id === selectedBankId) ?? state.accounts[0];
  const selectedCard =
    state.creditCards.find((c) => c.id === selectedCardId) ??
    state.creditCards[0];
  const selectedBudget =
    state.costCenters.find((b) => b.id === selectedBudgetId) ??
    state.costCenters[0];

  // Cálculo do realizado por categoria para a Tabela de Centros de Custo
  const spentByCategory = useMemo(() => {
    const map = new Map<TransactionCategory, number>();
    for (const tx of state.transactions) {
      if (tx.isExpense) {
        const current = map.get(tx.category) ?? 0;
        map.set(tx.category, Number((current + tx.amount).toFixed(2)));
      }
    }
    return map;
  }, [state.transactions]);

  const portalTabs: readonly {
    readonly id: PortalTab;
    readonly label: string;
  }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'statement', label: 'Extrato (Tabela)' },
    { id: 'accounts', label: 'Contas Open Finance' },
    { id: 'cards', label: 'Cartões & Faturas' },
    { id: 'costs', label: 'Análise de Custos' },
    { id: 'subscriptions_pix', label: 'Assinaturas & PIX' },
  ];

  return (
    <div className="min-h-screen nexo-page flex flex-col">
      <NexoNavbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* TOPO ESTILO NUBANK: Saudação + Controles discretos */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs nexo-text-muted mb-0.5">
              {authUser
                ? `Sincronizado no Firebase (${authUser.email ?? 'Sessão ativa'})`
                : 'Sessão Local • Entre para sincronizar na nuvem'}
            </p>
            <h1 className="font-heading text-xl sm:text-2xl tracking-tight">
              Olá, {userName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHideBalances((prev) => !prev)}
              title={hideBalances ? 'Mostrar valores' : 'Ocultar valores'}
              className="flex h-9 w-9 items-center justify-center rounded-full nexo-card nexo-text-secondary hover:text-[#ff5500] transition-colors"
            >
              {hideBalances ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                viewModel.switchFlavor(
                  state.activeFlavor === AppFlavor.DEV
                    ? AppFlavor.PROD
                    : AppFlavor.DEV,
                )
              }
              title="Alternar ambiente do gateway PIX"
              className="rounded-full nexo-card px-3.5 py-1.5 text-xs font-medium nexo-text-secondary hover:border-[#ff5500]/50 transition-colors"
            >
              {state.activeFlavor === AppFlavor.DEV ? 'Sandbox' : 'Asaas Live'}
            </button>

            <button
              type="button"
              onClick={() => void viewModel.resetDemoData()}
              title="Restaurar dados iniciais"
              className="flex h-9 w-9 items-center justify-center rounded-full nexo-card nexo-text-secondary hover:text-[#ff5500] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* NAVEGAÇÃO DE MÓDULOS DO PORTAL (Minimalista) */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1">
          {portalTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#ff5500] text-white'
                    : 'nexo-card nexo-text-secondary hover:border-[#ff5500]/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </section>

        {/* FEEDBACK DISCRETO */}
        {(state.errorMessage || state.feedbackBanner) && (
          <div className="rounded-2xl nexo-card border-[#ff5500]/40 p-4 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium">
              {state.errorMessage ?? state.feedbackBanner}
            </span>
            <button
              type="button"
              onClick={() => viewModel.clearNotices()}
              className="nexo-text-muted hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================================================
            MÓDULO 1: VISÃO GERAL (Nubank Style + Wizards)
           ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section className="rounded-3xl nexo-card p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.18em] nexo-text-muted block mb-2">
                    Saldo Consolidado Open Finance
                  </span>
                  <div className="font-heading text-3xl sm:text-4xl tracking-tight">
                    {summary
                      ? formatCurrency(
                          summary.consolidatedBalance,
                          hideBalances,
                        )
                      : 'R$ 0,00'}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="nexo-text-muted block mb-0.5">
                      Entradas no mês
                    </span>
                    <span className="font-semibold">
                      {summary
                        ? formatCurrency(summary.totalIncomeMonth, hideBalances)
                        : 'R$ 0,00'}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-[var(--border-subtle)]" />
                  <div>
                    <span className="nexo-text-muted block mb-0.5">
                      Saídas no mês
                    </span>
                    <span className="font-semibold">
                      {summary
                        ? formatCurrency(
                            summary.totalExpensesMonth,
                            hideBalances,
                          )
                        : 'R$ 0,00'}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-[var(--border-subtle)]" />
                  <div>
                    <span className="nexo-text-muted block mb-0.5">
                      Assinaturas
                    </span>
                    <span className="font-semibold">
                      {summary
                        ? formatCurrency(
                            summary.recurringSubscriptionsTotal,
                            hideBalances,
                          )
                        : 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              </div>

              {summary && summary.insights.length > 0 && (
                <button
                  type="button"
                  onClick={() => openWizard('assistant')}
                  className="mt-6 w-full rounded-2xl nexo-elevated px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors hover:border-[#ff5500]/50"
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-[#ff5500] shrink-0" />
                    <span className="font-medium">
                      {summary.insights[0]?.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#ff5500] font-medium shrink-0">
                    Analisar no Assistente →
                  </span>
                </button>
              )}
            </section>

            {/* AÇÕES RÁPIDAS CIRCULARES ESTILO NUBANK */}
            <section>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  {
                    id: 'transfer_pix' as const,
                    label: 'Transferir Pix',
                    icon: Send,
                  },
                  {
                    id: 'charge_pix' as const,
                    label: 'Cobrar QR',
                    icon: QrCode,
                  },
                  {
                    id: 'new_transaction' as const,
                    label: 'Novo Gasto',
                    icon: Plus,
                  },
                  {
                    id: 'open_finance' as const,
                    label: 'Meus Bancos',
                    icon: Building2,
                  },
                  {
                    id: 'card_manage' as const,
                    label: 'Pagar Fatura',
                    icon: CreditCard,
                  },
                  {
                    id: 'assistant' as const,
                    label: 'Assistente IA',
                    icon: Sparkles,
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => openWizard(action.id)}
                      className="group flex flex-col items-center gap-2.5 text-center"
                    >
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full nexo-card transition-all group-hover:border-[#ff5500] group-hover:scale-105">
                        <Icon className="h-5 w-5 transition-colors group-hover:text-[#ff5500]" />
                      </div>
                      <span className="text-xs font-medium nexo-text-secondary group-hover:text-[var(--text-primary)]">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* RESUMO RÁPIDO DAS TABELAS CORPORATIVAS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className="rounded-3xl nexo-card p-6 text-left hover:border-[#ff5500]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs nexo-text-muted uppercase tracking-wider">
                    Cartões & Faturas
                  </span>
                  <CreditCard className="h-4 w-4 text-[#ff5500]" />
                </div>
                <p className="font-heading text-xl mb-1">
                  {formatCurrency(
                    state.creditCards.reduce((acc, c) => acc + c.usedAmount, 0),
                    hideBalances,
                  )}
                </p>
                <p className="text-xs nexo-text-secondary">
                  {state.creditCards.length} cartões monitorados via Open
                  Finance →
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('costs')}
                className="rounded-3xl nexo-card p-6 text-left hover:border-[#ff5500]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs nexo-text-muted uppercase tracking-wider">
                    Centros de Custo
                  </span>
                  <PieChart className="h-4 w-4 text-[#ff5500]" />
                </div>
                <p className="font-heading text-xl mb-1">
                  {state.costCenters.length} orçamentos ativos
                </p>
                <p className="text-xs nexo-text-secondary">
                  Ver tabela de metas [Ideal vs Teto] →
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subscriptions_pix')}
                className="rounded-3xl nexo-card p-6 text-left hover:border-[#ff5500]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs nexo-text-muted uppercase tracking-wider">
                    Assinaturas & Chaves PIX
                  </span>
                  <Repeat className="h-4 w-4 text-[#ff5500]" />
                </div>
                <p className="font-heading text-xl mb-1">
                  {state.subscriptions.length} contratos •{' '}
                  {state.pixKeys.length} chaves
                </p>
                <p className="text-xs text-[#ff5500]">
                  1 alerta de assinatura duplicada →
                </p>
              </button>
            </section>
          </div>
        )}

        {/* =================================================================
            MÓDULO 2: TABELA DE EXTRATO & CONCILIAÇÃO MULTI-BANCO
           ================================================================= */}
        {activeTab === 'statement' && (
          <section className="rounded-3xl nexo-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-base">
                  Tabela de Lançamentos e Conciliação
                </h2>
                <p className="text-xs nexo-text-muted">
                  Livro-razão consolidado entre todas as contas conectadas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 nexo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => {
                      const q = e.target.value;
                      setSearchText(q);
                      void viewModel.filterTransactions({
                        query: q,
                        category: activeCategory,
                      });
                    }}
                    placeholder="Buscar descrição ou estabelecimento..."
                    className="rounded-full nexo-elevated pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => openWizard('new_transaction')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-2 text-xs font-medium text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Lançamento</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'Todas Categorias' },
                  { id: TransactionCategory.PIX, label: 'PIX' },
                  {
                    id: TransactionCategory.SUBSCRIPTIONS,
                    label: 'Assinaturas',
                  },
                  { id: TransactionCategory.FOOD, label: 'Alimentação' },
                  { id: TransactionCategory.HOUSING, label: 'Moradia' },
                  { id: TransactionCategory.SALARY, label: 'Receitas' },
                  {
                    id: TransactionCategory.INVESTMENTS,
                    label: 'Investimentos',
                  },
                ] as const
              ).map((cat) => {
                const selected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      void viewModel.filterTransactions({
                        query: searchText,
                        category: cat.id,
                      });
                    }}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-[#ff5500] text-white'
                        : 'nexo-elevated nexo-text-secondary'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] nexo-text-muted uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Descrição / Favorecido</th>
                    <th className="py-3 px-3">Instituição</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {state.filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-3 font-mono nexo-text-secondary">
                        {tx.dateIso}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-sm">{tx.title}</p>
                        <p className="nexo-text-muted">{tx.merchantName}</p>
                      </td>
                      <td className="py-3.5 px-3 nexo-text-secondary">
                        {getInstitutionDisplayName(tx.institution)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded-full nexo-elevated px-2.5 py-1 text-[11px]">
                          {tx.categoryLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] nexo-text-secondary">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" />
                          Conciliado
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-3 text-right font-heading text-xs ${
                          tx.isIncome ? 'text-[#ff5500]' : ''
                        }`}
                      >
                        {tx.isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, hideBalances)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =================================================================
            MÓDULO 3: TABELA DE CONTAS & CONSENTIMENTOS OPEN FINANCE
           ================================================================= */}
        {activeTab === 'accounts' && (
          <section className="rounded-3xl nexo-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-base">
                  Tabela de Contas Conectadas (Open Finance Brasil)
                </h2>
                <p className="text-xs nexo-text-muted">
                  Coordenadas bancárias modeladas como tupla imutável{' '}
                  <code>[codigoCompe, agencia, conta]</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openWizard('open_finance')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-2 text-xs font-medium text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sincronizar Instituição</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] nexo-text-muted uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Conta / Apelido</th>
                    <th className="py-3 px-3">Instituição Oficial</th>
                    <th className="py-3 px-3">Tupla Coordenadas</th>
                    <th className="py-3 px-3">Consentimento</th>
                    <th className="py-3 px-3 text-right">Saldo Consolidado</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {state.accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-3 font-medium text-sm">
                        {acc.nickname}
                      </td>
                      <td className="py-4 px-3 nexo-text-secondary">
                        {getInstitutionDisplayName(acc.institution)}
                      </td>
                      <td className="py-4 px-3 font-mono nexo-text-secondary">
                        {acc.formattedCoordinates}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            acc.isAuthorized
                              ? 'nexo-elevated'
                              : 'bg-[#ff5500]/15 text-[#ff5500]'
                          }`}
                        >
                          {acc.consentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right font-heading text-sm">
                        {formatCurrency(acc.balance, hideBalances)}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBankId(acc.id);
                            openWizard('open_finance');
                            setWizardStep(2);
                          }}
                          className="rounded-full nexo-elevated px-3 py-1.5 text-xs hover:text-[#ff5500]"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =================================================================
            MÓDULO 4: TABELA DE CARTÕES DE CRÉDITO & FATURAS
           ================================================================= */}
        {activeTab === 'cards' && (
          <section className="rounded-3xl nexo-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-base">
                  Tabela de Cartões de Crédito & Limites
                </h2>
                <p className="text-xs nexo-text-muted">
                  Limites modelados como tupla{' '}
                  <code>CardLimitTuple = readonly [utilizado, limiteTotal]</code>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => openWizard('card_manage')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-2 text-xs font-medium text-white"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Pagar Fatura / Ajustar Limite</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] nexo-text-muted uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Cartão</th>
                    <th className="py-3 px-3">Instituição</th>
                    <th className="py-3 px-3">Fechamento / Venc.</th>
                    <th className="py-3 px-3">Uso do Limite</th>
                    <th className="py-3 px-3 text-right">Fatura Atual</th>
                    <th className="py-3 px-3 text-right">Limite Total</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {state.creditCards.map((card) => (
                    <tr key={card.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-3">
                        <p className="font-medium text-sm">{card.cardName}</p>
                        <p className="font-mono nexo-text-muted">
                          •••• {card.lastFourDigits} • {card.brand}
                        </p>
                      </td>
                      <td className="py-4 px-3 nexo-text-secondary">
                        {card.institutionLabel}
                      </td>
                      <td className="py-4 px-3 nexo-text-secondary">
                        Dia {card.closingDay} / Dia {card.dueDay}
                      </td>
                      <td className="py-4 px-3 w-44">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span>{card.usagePercentage}%</span>
                          <span className="nexo-text-muted">
                            {card.invoiceStatus}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full nexo-elevated overflow-hidden">
                          <div
                            className="h-full bg-[#ff5500]"
                            style={{ width: `${card.usagePercentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-3 text-right font-heading text-sm">
                        {formatCurrency(card.usedAmount, hideBalances)}
                      </td>
                      <td className="py-4 px-3 text-right font-mono nexo-text-secondary">
                        {formatCurrency(card.totalLimit, hideBalances)}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCardId(card.id);
                            setNewCardLimitInput(String(card.totalLimit));
                            openWizard('card_manage');
                            setWizardStep(2);
                          }}
                          className="rounded-full nexo-elevated px-3 py-1.5 text-xs hover:text-[#ff5500]"
                        >
                          Opções
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =================================================================
            MÓDULO 5: TABELA DE ANÁLISE DE CUSTOS & CENTROS DE CUSTO
           ================================================================= */}
        {activeTab === 'costs' && (
          <section className="rounded-3xl nexo-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-base">
                  Tabela de Centros de Custo & Metas de Orçamento
                </h2>
                <p className="text-xs nexo-text-muted">
                  Comparativo entre gasto realizado e tupla{' '}
                  <code>BudgetThresholdTuple = [metaIdeal, tetoAlerta]</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openWizard('cost_budget')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-2 text-xs font-medium text-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Ajustar Metas (Wizard)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] nexo-text-muted uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Centro de Custo</th>
                    <th className="py-3 px-3">Área</th>
                    <th className="py-3 px-3 text-right">Meta Ideal</th>
                    <th className="py-3 px-3 text-right">Teto Alerta</th>
                    <th className="py-3 px-3 text-right">Realizado Mês</th>
                    <th className="py-3 px-3">Diagnóstico</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {state.costCenters.map((cc) => {
                    const spent = spentByCategory.get(cc.category) ?? 0;
                    const evaluation = cc.evaluateSpend(spent);
                    return (
                      <tr key={cc.id} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-3">
                          <p className="font-medium text-sm">
                            {cc.costCenterName}
                          </p>
                          <p className="nexo-text-muted">{cc.categoryLabel}</p>
                        </td>
                        <td className="py-4 px-3 nexo-text-secondary">
                          {cc.responsibleArea}
                        </td>
                        <td className="py-4 px-3 text-right font-mono nexo-text-secondary">
                          {formatCurrency(cc.idealLimit, hideBalances)}
                        </td>
                        <td className="py-4 px-3 text-right font-mono nexo-text-secondary">
                          {formatCurrency(cc.maxAlertCeiling, hideBalances)}
                        </td>
                        <td className="py-4 px-3 text-right font-heading text-sm">
                          {formatCurrency(spent, hideBalances)}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              evaluation.status === 'EXCEEDED' ||
                              evaluation.status === 'NEAR_LIMIT'
                                ? 'bg-[#ff5500]/15 text-[#ff5500]'
                                : 'nexo-elevated'
                            }`}
                          >
                            {evaluation.status === 'EXCEEDED'
                              ? 'Acima do Teto'
                              : evaluation.status === 'NEAR_LIMIT'
                                ? 'Acima da Meta Ideal'
                                : 'Dentro da Meta'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBudgetId(cc.id);
                              setBudgetIdealInput(String(cc.idealLimit));
                              setBudgetCeilingInput(String(cc.maxAlertCeiling));
                              openWizard('cost_budget');
                              setWizardStep(2);
                            }}
                            className="rounded-full nexo-elevated px-3 py-1.5 text-xs hover:text-[#ff5500]"
                          >
                            Editar Meta
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =================================================================
            MÓDULO 6: TABELAS DE ASSINATURAS RECORRENTES & CHAVES PIX
           ================================================================= */}
        {activeTab === 'subscriptions_pix' && (
          <div className="space-y-8">
            {/* TABELA 5: RADAR DE ASSINATURAS */}
            <section className="rounded-3xl nexo-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-base">
                    Tabela de Assinaturas & Contratos Recorrentes
                  </h2>
                  <p className="text-xs nexo-text-muted">
                    Auditoria automática de cobranças mensais e impacto anual
                    projetado (12 meses).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] nexo-text-muted uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">Serviço / Contrato</th>
                      <th className="py-3 px-3">Instituição</th>
                      <th className="py-3 px-3">Cobrança</th>
                      <th className="py-3 px-3 text-right">Valor Mensal</th>
                      <th className="py-3 px-3 text-right">Projeção Anual</th>
                      <th className="py-3 px-3">Status Auditoria</th>
                      <th className="py-3 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {state.subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-3 font-medium text-sm">
                          {sub.serviceName}
                        </td>
                        <td className="py-4 px-3 nexo-text-secondary">
                          {getInstitutionDisplayName(sub.institution)}
                        </td>
                        <td className="py-4 px-3 nexo-text-secondary">
                          Todo dia {sub.billingDay}
                        </td>
                        <td className="py-4 px-3 text-right font-heading text-xs">
                          {formatCurrency(sub.monthlyAmount, hideBalances)}
                        </td>
                        <td className="py-4 px-3 text-right font-mono nexo-text-secondary">
                          {formatCurrency(sub.annualProjection, hideBalances)}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              sub.status === 'DUPLICATE_ALERT'
                                ? 'bg-[#ff5500] text-white'
                                : 'nexo-elevated'
                            }`}
                          >
                            {sub.status === 'DUPLICATE_ALERT'
                              ? 'Duplicidade Detectada'
                              : sub.status === 'PAUSED'
                                ? 'Pausada / Cancelada'
                                : 'Ativa'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              viewModel.toggleSubscriptionStatus(sub.id)
                            }
                            className="rounded-full nexo-elevated px-3 py-1.5 text-xs hover:text-[#ff5500]"
                          >
                            {sub.status === 'DUPLICATE_ALERT'
                              ? 'Cancelar Duplicada'
                              : sub.status === 'PAUSED'
                                ? 'Reativar'
                                : 'Pausar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* TABELA 6: CHAVES PIX REGISTRADAS */}
            <section className="rounded-3xl nexo-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-base">
                    Tabela de Minhas Chaves PIX Registradas
                  </h2>
                  <p className="text-xs nexo-text-muted">
                    Chaves validadas por regex e exaustividade em{' '}
                    <code>PixKeyValidator</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openWizard('new_pix_key')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-2 text-xs font-medium text-white"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Cadastrar Chave PIX</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] nexo-text-muted uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">Identificação</th>
                      <th className="py-3 px-3">Tipo</th>
                      <th className="py-3 px-3">Chave Validada</th>
                      <th className="py-3 px-3">Conta Vinculada</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {state.pixKeys.map((pk) => (
                      <tr key={pk.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-3 font-medium text-sm">
                          {pk.label}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="rounded-full nexo-elevated px-2.5 py-1 text-[11px]">
                            {pk.keyType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono nexo-text-secondary">
                          {pk.keyValue}
                        </td>
                        <td className="py-3.5 px-3 nexo-text-secondary">
                          {getInstitutionDisplayName(pk.institution)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {pk.isPrimary ? (
                            <span className="text-[#ff5500] font-medium">
                              Principal
                            </span>
                          ) : (
                            <span className="nexo-text-muted">Ativa</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {!authUser && (
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs nexo-text-secondary hover:text-[#ff5500] transition-colors"
            >
              Deseja salvar seus lançamentos no Cloud Firestore? Entre na sua
              conta →
            </Link>
          </div>
        )}
      </main>

      {/* =====================================================================
          MODAL WIZARD PASSO A PASSO ESTILO NUBANK
         ===================================================================== */}
      {activeWizard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl nexo-card p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Wizard */}
            <div className="flex items-center justify-between mb-6">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => s - 1)}
                  className="inline-flex items-center gap-1 text-xs nexo-text-secondary hover:text-[#ff5500]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </button>
              ) : (
                <span className="text-xs font-medium text-[#ff5500] uppercase tracking-wider">
                  Fluxo Guiado Passo a Passo
                </span>
              )}

              <button
                type="button"
                onClick={closeWizard}
                className="flex h-8 w-8 items-center justify-center rounded-full nexo-elevated nexo-text-secondary hover:text-[#ff5500]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* WIZARD 1: TRANSFERIR PIX (3 PASSOS) */}
            {activeWizard === 'transfer_pix' && (
              <div className="space-y-6">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`h-1 flex-1 rounded-full ${
                        wizardStep >= s
                          ? 'bg-[#ff5500]'
                          : 'bg-[var(--border-subtle)]'
                      }`}
                    />
                  ))}
                </div>

                {wizardStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Qual é o valor da transferência?
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Saldo disponível na conta Asaas:{' '}
                        {formatCurrency(
                          state.accounts.find(
                            (a) => a.institution === InstitutionCode.ASAAS,
                          )?.balance ?? 0,
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs nexo-text-muted mb-2">
                        Valor em R$
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        autoFocus
                        value={pixTransferAmount}
                        onChange={(e) => setPixTransferAmount(e.target.value)}
                        className="w-full rounded-2xl nexo-elevated px-4 py-4 font-heading text-2xl focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white"
                    >
                      Continuar
                    </button>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Para quem você quer enviar{' '}
                        {formatCurrency(Number(pixTransferAmount) || 0)}?
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Selecione o tipo de chave e informe os dados do
                        destinatário.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {(['CPF', 'EMAIL', 'PHONE', 'RANDOM'] as const).map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setPixKeyType(t)}
                            className={`rounded-xl py-2 text-xs font-medium ${
                              pixKeyType === t
                                ? 'bg-[#ff5500] text-white'
                                : 'nexo-elevated nexo-text-secondary'
                            }`}
                          >
                            {t}
                          </button>
                        ),
                      )}
                    </div>

                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Chave PIX ({pixKeyType})
                      </label>
                      <input
                        type="text"
                        value={pixKeyValue}
                        onChange={(e) => setPixKeyValue(e.target.value)}
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Nome do favorecido
                      </label>
                      <input
                        type="text"
                        value={pixRecipientName}
                        onChange={(e) => setPixRecipientName(e.target.value)}
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white"
                    >
                      Revisar transferência
                    </button>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Confirme os dados
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Verifique as informações antes de enviar o PIX.
                      </p>
                    </div>

                    <div className="rounded-2xl nexo-elevated p-4 space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="nexo-text-muted">Valor</span>
                        <span className="font-heading text-sm text-[#ff5500]">
                          {formatCurrency(Number(pixTransferAmount) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="nexo-text-muted">Para</span>
                        <span className="font-medium">{pixRecipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="nexo-text-muted">
                          Chave ({pixKeyType})
                        </span>
                        <span className="font-mono">{pixKeyValue}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleConfirmPixTransfer()}
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white"
                    >
                      Confirmar e enviar PIX
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* WIZARD 2: COBRAR VIA QR CODE PIX (2 PASSOS) */}
            {activeWizard === 'charge_pix' && (
              <div className="space-y-6">
                <div className="flex gap-1.5">
                  {[1, 2].map((s) => (
                    <span
                      key={s}
                      className={`h-1 flex-1 rounded-full ${
                        wizardStep >= s
                          ? 'bg-[#ff5500]'
                          : 'bg-[var(--border-subtle)]'
                      }`}
                    />
                  ))}
                </div>

                {wizardStep === 1 ? (
                  <form
                    onSubmit={(e) => void handleGeneratePixQr(e)}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Qual valor você quer receber?
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Gere um QR Code PIX imediato pela conta Asaas.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Valor da cobrança (R$)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={pixChargeAmount}
                        onChange={(e) => setPixChargeAmount(e.target.value)}
                        className="w-full rounded-2xl nexo-elevated px-4 py-4 font-heading text-2xl focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Descrição
                      </label>
                      <input
                        type="text"
                        required
                        value={pixChargeDesc}
                        onChange={(e) => setPixChargeDesc(e.target.value)}
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white"
                    >
                      Gerar QR Code PIX
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Cobrança PIX pronta
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Compartilhe o código Copia e Cola abaixo.
                      </p>
                    </div>

                    {state.activePixCharge && (
                      <div className="rounded-2xl nexo-elevated p-4 space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="nexo-text-muted">Valor</span>
                          <span className="font-heading text-[#ff5500]">
                            {formatCurrency(state.activePixCharge.amount)}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono break-all nexo-text-secondary bg-black/20 p-3 rounded-xl">
                          {state.activePixCharge.qrPayload[0]}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopyQrPayload(
                              state.activePixCharge!.qrPayload[0],
                            )
                          }
                          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] py-3 text-xs font-medium text-white"
                        >
                          {copiedQr ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copiar código PIX</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* WIZARD 3: NOVO LANÇAMENTO (3 PASSOS) */}
            {activeWizard === 'new_transaction' && (
              <div className="space-y-6">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`h-1 flex-1 rounded-full ${
                        wizardStep >= s
                          ? 'bg-[#ff5500]'
                          : 'bg-[var(--border-subtle)]'
                      }`}
                    />
                  ))}
                </div>

                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl">
                      Qual o tipo de registro?
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTxType('EXPENSE');
                          setWizardStep(2);
                        }}
                        className="rounded-2xl nexo-elevated p-5 text-left hover:border-[#ff5500] transition-colors"
                      >
                        <ArrowUpRight className="h-5 w-5 text-[#ff5500] mb-3" />
                        <span className="font-heading text-sm block mb-1">
                          Saída
                        </span>
                        <span className="text-xs nexo-text-muted">
                          Gasto, compra ou assinatura
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTxType('INCOME');
                          setWizardStep(2);
                        }}
                        className="rounded-2xl nexo-elevated p-5 text-left hover:border-[#ff5500] transition-colors"
                      >
                        <ArrowDownLeft className="h-5 w-5 text-[#ff5500] mb-3" />
                        <span className="font-heading text-sm block mb-1">
                          Entrada
                        </span>
                        <span className="text-xs nexo-text-muted">
                          Receita, salário ou recebimento
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-5">
                    <h3 className="font-heading text-xl">
                      Valor e identificação
                    </h3>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Valor (R$)
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        autoFocus
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full rounded-2xl nexo-elevated px-4 py-3.5 font-heading text-xl focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={txTitle}
                        onChange={(e) => setTxTitle(e.target.value)}
                        placeholder="Ex.: Jantar, Supermercado, Projeto..."
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (Number(txAmount) > 0 && txTitle.trim().length >= 2) {
                          setWizardStep(3);
                        }
                      }}
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white"
                    >
                      Continuar
                    </button>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-5">
                    <h3 className="font-heading text-xl">
                      Categoria e instituição
                    </h3>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Categoria
                      </label>
                      <select
                        value={txCategory}
                        onChange={(e) =>
                          setTxCategory(e.target.value as TransactionCategory)
                        }
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                      >
                        {Object.values(TransactionCategory).map((c) => (
                          <option key={c} value={c}>
                            {getCategoryLabel(c)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1.5">
                        Instituição
                      </label>
                      <select
                        value={txInstitution}
                        onChange={(e) =>
                          setTxInstitution(e.target.value as InstitutionCode)
                        }
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                      >
                        {Object.values(InstitutionCode).map((inst) => (
                          <option key={inst} value={inst}>
                            {getInstitutionDisplayName(inst)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCreateTransaction()}
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-sm font-medium text-white"
                    >
                      Confirmar lançamento
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* WIZARD 4: OPEN FINANCE (2 PASSOS) */}
            {activeWizard === 'open_finance' && (
              <div className="space-y-5">
                {wizardStep === 1 ? (
                  <>
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Conexões Open Finance
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Toque em uma instituição para sincronizar ou gerenciar o
                        consentimento.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {state.accounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setSelectedBankId(acc.id);
                            setWizardStep(2);
                          }}
                          className="w-full rounded-2xl nexo-elevated p-4 flex items-center justify-between text-left hover:border-[#ff5500]"
                        >
                          <div>
                            <p className="text-sm font-medium">{acc.nickname}</p>
                            <p className="text-xs nexo-text-muted">
                              {acc.formattedCoordinates}
                            </p>
                          </div>
                          <span className="font-heading text-xs">
                            {formatCurrency(acc.balance)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  selectedBank && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-heading text-xl mb-1">
                          {selectedBank.nickname}
                        </h3>
                        <p className="text-xs nexo-text-muted">
                          {selectedBank.formattedCoordinates}
                        </p>
                      </div>

                      <div className="rounded-2xl nexo-elevated p-4 flex justify-between items-center">
                        <span className="text-xs nexo-text-secondary">
                          Saldo atual
                        </span>
                        <span className="font-heading text-lg">
                          {formatCurrency(selectedBank.balance)}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            void viewModel.syncInstitution(
                              selectedBank.institution,
                            );
                            closeWizard();
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] py-3.5 text-xs font-medium text-white"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Sincronizar agora via Open Finance</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void viewModel.toggleAccountConsent(
                              selectedBank.id,
                              !selectedBank.isAuthorized,
                            );
                            closeWizard();
                          }}
                          className="w-full rounded-full nexo-elevated py-3 text-xs font-medium nexo-text-secondary hover:text-[#ff5500]"
                        >
                          {selectedBank.isAuthorized
                            ? 'Revogar consentimento Open Finance'
                            : 'Reautorizar compartilhamento'}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* WIZARD 5: GERENCIAR CARTÃO & FATURA (2 PASSOS) */}
            {activeWizard === 'card_manage' && (
              <div className="space-y-5">
                {wizardStep === 1 ? (
                  <>
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Escolha o cartão
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Selecione um cartão para pagar a fatura ou ajustar o
                        limite.
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {state.creditCards.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCardId(c.id);
                            setNewCardLimitInput(String(c.totalLimit));
                            setWizardStep(2);
                          }}
                          className="w-full rounded-2xl nexo-elevated p-4 flex items-center justify-between text-left hover:border-[#ff5500]"
                        >
                          <div>
                            <p className="text-sm font-medium">{c.cardName}</p>
                            <p className="text-xs nexo-text-muted">
                              Final {c.lastFourDigits} • {c.invoiceStatus}
                            </p>
                          </div>
                          <span className="font-heading text-xs">
                            {formatCurrency(c.usedAmount)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  selectedCard && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-heading text-xl mb-1">
                          {selectedCard.cardName}
                        </h3>
                        <p className="text-xs nexo-text-muted">
                          Fatura atual:{' '}
                          {formatCurrency(selectedCard.usedAmount)} • Disponível:{' '}
                          {formatCurrency(selectedCard.availableLimit)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          void viewModel.payCardInvoice(selectedCard.id);
                          closeWizard();
                        }}
                        className="w-full rounded-full bg-[#ff5500] py-3.5 text-xs font-medium text-white"
                      >
                        Pagar fatura integral (
                        {formatCurrency(selectedCard.usedAmount)})
                      </button>

                      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                        <label className="block text-xs nexo-text-muted">
                          Ajustar limite total aprovado (R$)
                        </label>
                        <input
                          type="number"
                          value={newCardLimitInput}
                          onChange={(e) => setNewCardLimitInput(e.target.value)}
                          className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const ok = viewModel.adjustCardLimit(
                              selectedCard.id,
                              Number(newCardLimitInput),
                            );
                            if (ok) closeWizard();
                          }}
                          className="w-full rounded-full nexo-elevated py-3 text-xs font-medium hover:text-[#ff5500]"
                        >
                          Salvar novo limite
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* WIZARD 6: EDITAR META DE CENTRO DE CUSTO (2 PASSOS) */}
            {activeWizard === 'cost_budget' && (
              <div className="space-y-5">
                {wizardStep === 1 ? (
                  <>
                    <div>
                      <h3 className="font-heading text-xl mb-1">
                        Qual centro de custo deseja ajustar?
                      </h3>
                      <p className="text-xs nexo-text-secondary">
                        Configure a tupla [Meta Ideal, Teto Máximo de Alerta].
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {state.costCenters.map((cc) => (
                        <button
                          key={cc.id}
                          type="button"
                          onClick={() => {
                            setSelectedBudgetId(cc.id);
                            setBudgetIdealInput(String(cc.idealLimit));
                            setBudgetCeilingInput(String(cc.maxAlertCeiling));
                            setWizardStep(2);
                          }}
                          className="w-full rounded-2xl nexo-elevated p-4 flex items-center justify-between text-left hover:border-[#ff5500]"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {cc.costCenterName}
                            </p>
                            <p className="text-xs nexo-text-muted">
                              Ideal: {formatCurrency(cc.idealLimit)} • Teto:{' '}
                              {formatCurrency(cc.maxAlertCeiling)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  selectedBudget && (
                    <div className="space-y-4">
                      <h3 className="font-heading text-xl">
                        {selectedBudget.costCenterName}
                      </h3>
                      <div>
                        <label className="block text-xs nexo-text-muted mb-1">
                          Meta Ideal Mensal (R$)
                        </label>
                        <input
                          type="number"
                          value={budgetIdealInput}
                          onChange={(e) => setBudgetIdealInput(e.target.value)}
                          className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs nexo-text-muted mb-1">
                          Teto Máximo de Alerta (R$)
                        </label>
                        <input
                          type="number"
                          value={budgetCeilingInput}
                          onChange={(e) =>
                            setBudgetCeilingInput(e.target.value)
                          }
                          className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveCostBudget}
                        className="w-full rounded-full bg-[#ff5500] py-3.5 text-xs font-medium text-white"
                      >
                        Salvar tupla de orçamento
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* WIZARD 7: CADASTRAR NOVA CHAVE PIX (2 PASSOS) */}
            {activeWizard === 'new_pix_key' && (
              <div className="space-y-5">
                {wizardStep === 1 ? (
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl">
                      Qual tipo de chave PIX deseja registrar?
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(['EMAIL', 'CPF', 'PHONE', 'RANDOM'] as const).map(
                        (kt) => (
                          <button
                            key={kt}
                            type="button"
                            onClick={() => {
                              setNewKeyType(kt);
                              setWizardStep(2);
                            }}
                            className="rounded-2xl nexo-elevated p-4 text-left hover:border-[#ff5500]"
                          >
                            <span className="font-heading text-xs block mb-1 text-[#ff5500]">
                              {kt}
                            </span>
                            <span className="text-xs nexo-text-secondary">
                              Registrar {kt}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl">
                      Informe os dados da chave ({newKeyType})
                    </h3>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1">
                        Apelido da chave
                      </label>
                      <input
                        type="text"
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        placeholder="Ex.: PIX Comercial Exímia"
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1">
                        Valor da chave ({newKeyType})
                      </label>
                      <input
                        type="text"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Digite a chave..."
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs nexo-text-muted mb-1">
                        Instituição vinculada
                      </label>
                      <select
                        value={newKeyInst}
                        onChange={(e) =>
                          setNewKeyInst(e.target.value as InstitutionCode)
                        }
                        className="w-full rounded-2xl nexo-elevated px-4 py-3 text-sm"
                      >
                        {Object.values(InstitutionCode).map((inst) => (
                          <option key={inst} value={inst}>
                            {getInstitutionDisplayName(inst)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegisterPixKey}
                      className="w-full rounded-full bg-[#ff5500] py-3.5 text-xs font-medium text-white"
                    >
                      Validar e registrar chave
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* WIZARD 8: ASSISTENTE FINANCEIRO & AUDITORIA */}
            {activeWizard === 'assistant' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-heading text-xl mb-1">
                    Assistente Nexo
                  </h3>
                  <p className="text-xs nexo-text-secondary">
                    Análise automática de assinaturas, tetos de gastos e dúvidas
                    rápidas.
                  </p>
                </div>

                {summary && summary.insights.length > 0 && (
                  <div className="space-y-2">
                    {summary.insights.map((ins) => (
                      <div
                        key={ins.id}
                        className="rounded-2xl nexo-elevated p-3.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-[#ff5500]" />
                            {ins.title}
                          </span>
                        </div>
                        <p className="nexo-text-secondary leading-relaxed">
                          {ins.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {state.assistantHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'USER'
                          ? 'bg-[#ff5500] text-white ml-8'
                          : 'nexo-elevated mr-4'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Qual meu saldo total?',
                    'Tem cobrança duplicada?',
                    'Quanto gastei com assinaturas?',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => viewModel.askAssistant(q)}
                      className="rounded-full nexo-elevated px-3 py-1 text-[11px] nexo-text-secondary hover:text-[#ff5500]"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleAskAssistant}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Pergunte sobre suas finanças..."
                    className="flex-1 rounded-full nexo-elevated px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff5500]"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#ff5500] px-4 py-2.5 text-xs font-medium text-white"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
