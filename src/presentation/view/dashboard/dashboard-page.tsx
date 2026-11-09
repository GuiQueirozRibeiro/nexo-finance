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
  Eye,
  EyeOff,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
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

type ActiveWizard =
  | null
  | 'transfer_pix'
  | 'charge_pix'
  | 'new_transaction'
  | 'open_finance'
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

  // Estado Assistente
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

  return (
    <div className="min-h-screen nexo-page flex flex-col">
      <NexoNavbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* TOPO ESTILO NUBANK: Saudação + Controles discretos */}
        <section className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs nexo-text-muted mb-0.5">
              {authUser
                ? 'Sincronizado com Firebase'
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
              className="rounded-full nexo-card px-3 py-1.5 text-[11px] font-medium nexo-text-secondary hover:border-[#ff5500]/50 transition-colors"
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

        {/* CARTÃO PRINCIPAL DE SALDO — Minimalista Preto/Branco + Detalhe Laranja */}
        <section className="rounded-3xl nexo-card p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] nexo-text-muted block mb-2">
                Saldo Consolidado Open Finance
              </span>
              <div className="font-heading text-3xl sm:text-4xl tracking-tight">
                {summary
                  ? formatCurrency(summary.consolidatedBalance, hideBalances)
                  : 'R$ 0,00'}
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="nexo-text-muted block mb-0.5">Entradas</span>
                <span className="font-semibold">
                  {summary
                    ? formatCurrency(summary.totalIncomeMonth, hideBalances)
                    : 'R$ 0,00'}
                </span>
              </div>
              <div className="h-7 w-px bg-[var(--border-subtle)]" />
              <div>
                <span className="nexo-text-muted block mb-0.5">Saídas</span>
                <span className="font-semibold">
                  {summary
                    ? formatCurrency(summary.totalExpensesMonth, hideBalances)
                    : 'R$ 0,00'}
                </span>
              </div>
            </div>
          </div>

          {/* Alerta discreto caso o motor detecte cobrança duplicada */}
          {summary && summary.insights.length > 0 && (
            <button
              type="button"
              onClick={() => openWizard('assistant')}
              className="mt-6 w-full rounded-2xl nexo-elevated px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors hover:border-[#ff5500]/50"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#ff5500] shrink-0" />
                <span className="font-medium">{summary.insights[0]?.title}</span>
              </div>
              <span className="text-[11px] text-[#ff5500] font-medium shrink-0">
                Ver detalhes →
              </span>
            </button>
          )}
        </section>

        {/* AÇÕES RÁPIDAS CIRCULARES ESTILO NUBANK (Abrem Wizards Passo a Passo) */}
        <section>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
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
                id: 'assistant' as const,
                label: 'Assistente',
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
                  <span className="text-[11px] sm:text-xs font-medium nexo-text-secondary group-hover:text-[var(--text-primary)]">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTAS CONECTADAS (Resumo Limpo) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm tracking-wide">
              Contas Conectadas
            </h2>
            <button
              type="button"
              onClick={() => openWizard('open_finance')}
              className="text-xs text-[#ff5500] hover:underline"
            >
              Gerenciar conexões
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  setSelectedBankId(acc.id);
                  openWizard('open_finance');
                }}
                className="rounded-2xl nexo-card p-4 flex items-center justify-between text-left transition-colors hover:border-[#ff5500]/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{acc.nickname}</span>
                    {!acc.isAuthorized && (
                      <span className="text-[10px] text-[#ff5500]">
                        Pausado
                      </span>
                    )}
                  </div>
                  <span className="text-xs nexo-text-muted">
                    {getInstitutionDisplayName(acc.institution)}
                  </span>
                </div>
                <span className="font-heading text-sm">
                  {formatCurrency(acc.balance, hideBalances)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* HISTÓRICO DE MOVIMENTAÇÕES */}
        <section className="rounded-3xl nexo-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-heading text-sm tracking-wide">Histórico</h2>

            <div className="relative flex-1 sm:max-w-xs">
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
                placeholder="Buscar lançamento..."
                className="w-full rounded-full nexo-elevated pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'ALL', label: 'Todos' },
                { id: TransactionCategory.PIX, label: 'PIX' },
                { id: TransactionCategory.SUBSCRIPTIONS, label: 'Assinaturas' },
                { id: TransactionCategory.FOOD, label: 'Alimentação' },
                { id: TransactionCategory.SALARY, label: 'Entradas' },
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

          <div className="divide-y divide-[var(--border-subtle)]">
            {state.filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full nexo-elevated">
                    {tx.isIncome ? (
                      <ArrowDownLeft className="h-4 w-4 text-[#ff5500]" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 nexo-text-secondary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.title}</p>
                    <p className="text-xs nexo-text-muted">
                      {getInstitutionDisplayName(tx.institution)} •{' '}
                      {tx.categoryLabel} • {tx.dateIso}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-heading text-xs sm:text-sm shrink-0 ${
                    tx.isIncome ? 'text-[#ff5500]' : ''
                  }`}
                >
                  {tx.isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount, hideBalances)}
                </span>
              </div>
            ))}
          </div>
        </section>

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
                  Fluxo Guiado
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

            {/* WIZARD 5: ASSISTENTE FINANCEIRO & AUDITORIA */}
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
