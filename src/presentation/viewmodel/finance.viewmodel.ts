/**
 * FinanceViewModel — Camada Presentation / MVVM (inspirado em MediaProvider do App_Nasa).
 *
 * 100% TypeScript puro (sem dependência de React), permitindo testar toda a gestão de estado
 * em testes unitários Node/Vitest.
 *
 * Princípios aplicados:
 * - MVVM: expõe estado imutável (DeepReadonly) e comandos assíncronos para a View.
 * - DIP (SOLID): recebe os UseCases e o DataSource híbrido (localStorage + Cloud Firestore) injetados.
 * - Encapsulamento OOP: estado interno privado (`private _state`) e lista de observadores (`private readonly _listeners`).
 */

import {
  type AppFlavor,
  BrowserConnectionChecker,
  type DeepReadonly,
  FlavorConfig,
  type InstitutionCode,
  NoParams,
  TransactionCategory,
} from '@/core';
import {
  BankAccountModel,
  FinanceLocalDataSourceImpl,
  type IFinanceLocalDataSource,
  OpenFinanceRepositoryImpl,
  PixGatewayDataSourceImpl,
  PixGatewayRepositoryImpl,
  TransactionRepositoryImpl,
} from '@/data';
import {
  type BankAccount,
  type BankAccountProps,
  CostCenterBudget,
  type CostCenterBudgetProps,
  CreatePixChargeUseCase,
  CreateTransactionUseCase,
  CreditCardAccount,
  type CreditCardAccountProps,
  type DashboardSummary,
  ExecutePixTransferUseCase,
  GetDashboardSnapshotUseCase,
  PierreFinancialEngine,
  type PixChargeEntity,
  type PixTransferReceipt,
  type PixTransferRequest,
  RecurringSubscription,
  type RecurringSubscriptionProps,
  RegisteredPixKey,
  type RegisteredPixKeyProps,
  SearchTransactionsUseCase,
  SyncOpenFinanceInstitutionUseCase,
  ToggleOpenFinanceConsentUseCase,
  type Transaction,
  type TransactionFilterCriteria,
  type TransactionProps,
} from '@/domain';

export interface AssistantMessage {
  readonly id: string;
  readonly sender: 'USER' | 'PIERRE_AI';
  readonly text: string;
  readonly timestampIso: string;
}

export interface FinanceViewState {
  readonly isLoading: boolean;
  readonly isCloudSyncing: boolean;
  readonly errorMessage: string | null;
  readonly feedbackBanner: string | null;
  readonly activeFlavor: AppFlavor;
  readonly accounts: readonly BankAccount[];
  readonly transactions: readonly Transaction[];
  readonly filteredTransactions: readonly Transaction[];
  readonly creditCards: readonly CreditCardAccount[];
  readonly costCenters: readonly CostCenterBudget[];
  readonly subscriptions: readonly RecurringSubscription[];
  readonly pixKeys: readonly RegisteredPixKey[];
  readonly summary: DashboardSummary | null;
  readonly activePixCharge: PixChargeEntity | null;
  readonly lastPixReceipt: PixTransferReceipt | null;
  readonly assistantHistory: readonly AssistantMessage[];
}

export type ViewStateListener = (
  state: DeepReadonly<FinanceViewState>,
) => void;

export class FinanceViewModel {
  private readonly _listeners: Set<ViewStateListener> = new Set();
  private _state: FinanceViewState;
  private readonly _localDataSource: IFinanceLocalDataSource;

  public constructor(
    private readonly _getDashboardSnapshot: GetDashboardSnapshotUseCase,
    private readonly _searchTransactions: SearchTransactionsUseCase,
    private readonly _createTransaction: CreateTransactionUseCase,
    private readonly _syncOpenFinance: SyncOpenFinanceInstitutionUseCase,
    private readonly _toggleConsent: ToggleOpenFinanceConsentUseCase,
    private readonly _createPixCharge: CreatePixChargeUseCase,
    private readonly _executePixTransfer: ExecutePixTransferUseCase,
    private readonly _resetSeedCallback?: () => void,
    localDataSource?: IFinanceLocalDataSource,
  ) {
    this._localDataSource = localDataSource ?? new FinanceLocalDataSourceImpl();
    this._state = {
      isLoading: true,
      isCloudSyncing: false,
      errorMessage: null,
      feedbackBanner: null,
      activeFlavor: FlavorConfig.currentFlavor,
      accounts: [],
      transactions: [],
      filteredTransactions: [],
      creditCards: this._localDataSource.getCreditCards(),
      costCenters: this._localDataSource.getCostCenters(),
      subscriptions: this._localDataSource.getSubscriptions(),
      pixKeys: this._localDataSource.getPixKeys(),
      summary: null,
      activePixCharge: null,
      lastPixReceipt: null,
      assistantHistory: [
        {
          id: 'msg-welcome',
          sender: 'PIERRE_AI',
          text: 'Olá, Guilherme! Sou o assistente Nexo IA (inspirado no Pierre). Suas 6 tabelas financeiras (Contas Open Finance, Extrato, Cartões, Centros de Custo, Assinaturas e Chaves PIX) estão sincronizadas. Pergunte sobre "assinaturas", "cobranças duplicadas", "saldo" ou "maior gasto".',
          timestampIso: new Date().toISOString(),
        },
      ],
    };
  }

  public get state(): DeepReadonly<FinanceViewState> {
    return this._state;
  }

  public subscribe(listener: ViewStateListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _emit(patch: Partial<FinanceViewState>): void {
    this._state = {
      ...this._state,
      ...patch,
    };
    for (const listener of this._listeners) {
      listener(this._state);
    }
  }

  public clearNotices(): void {
    this._emit({ errorMessage: null, feedbackBanner: null });
  }

  public async loadDashboard(): Promise<void> {
    this._emit({ isLoading: true, errorMessage: null });

    const result = await this._getDashboardSnapshot.execute(NoParams.instance);

    result.fold(
      (failure) => {
        this._emit({
          isLoading: false,
          errorMessage: failure.toSummary(),
        });
      },
      (snapshot) => {
        this._emit({
          isLoading: false,
          errorMessage: null,
          accounts: snapshot.accounts,
          transactions: snapshot.transactions,
          filteredTransactions: snapshot.transactions,
          creditCards: this._localDataSource.getCreditCards(),
          costCenters: this._localDataSource.getCostCenters(),
          subscriptions: this._localDataSource.getSubscriptions(),
          pixKeys: this._localDataSource.getPixKeys(),
          summary: snapshot.summary,
        });
      },
    );
  }

  /**
   * Hidrata todas as 6 tabelas do usuário autenticado a partir do Cloud Firestore (`users/{uid}/finance/snapshot`)
   * ou cria o documento inicial na nuvem no primeiro login.
   */
  public async syncWithCloudFirestore(): Promise<void> {
    this._emit({ isCloudSyncing: true });
    const synced = await this._localDataSource.syncFromFirestore();
    if (synced) {
      await this.loadDashboard();
    }
    this._emit({ isCloudSyncing: false });
  }

  // =========================================================================
  // TABELA 1: CONTAS BANCÁRIAS OPEN FINANCE (`BankAccount`)
  // =========================================================================

  public async connectNewBankAccount(props: BankAccountProps): Promise<boolean> {
    if (!props.nickname.trim()) {
      this._emit({
        errorMessage: 'Informe um apelido válido para a conta bancária.',
      });
      return false;
    }
    const existing = this._localDataSource.getAccounts();
    const model = new BankAccountModel(props);
    this._localDataSource.saveAccounts([...existing, model]);
    await this.loadDashboard();
    this._emit({
      feedbackBanner: `Instituição ${model.nickname} conectada via Open Finance e salva no seu perfil.`,
    });
    return true;
  }

  public async deleteBankAccount(accountId: string): Promise<void> {
    const existing = this._localDataSource.getAccounts();
    if (existing.length <= 1) {
      this._emit({
        errorMessage:
          'Mantenha ao menos uma conta bancária ativa no portal Nexo.',
      });
      return;
    }
    const target = existing.find((a) => a.id === accountId);
    const filtered = existing.filter((a) => a.id !== accountId);
    this._localDataSource.saveAccounts(filtered);
    await this.loadDashboard();
    this._emit({
      feedbackBanner: `Conexão com "${target?.nickname ?? accountId}" removida.`,
    });
  }

  public async syncInstitution(institution: InstitutionCode): Promise<void> {
    this._emit({ isLoading: true, errorMessage: null });

    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      try {
        await fetch('/api/open-finance/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ institution }),
        });
      } catch {
        // Continua com a reconciliação local caso esteja offline
      }
    }

    const result = await this._syncOpenFinance.execute(institution);

    if (result.isLeft()) {
      this._emit({
        isLoading: false,
        errorMessage: result.value.toSummary(),
      });
      return;
    }

    await this.loadDashboard();
    this._emit({
      feedbackBanner: `Open Finance sincronizado com ${institution}: saldo atualizado para R$ ${result.value.updatedBalance.toFixed(2)}.`,
    });
  }

  public async toggleAccountConsent(
    accountId: string,
    authorize: boolean,
  ): Promise<void> {
    const result = await this._toggleConsent.execute({ accountId, authorize });
    if (result.isLeft()) {
      this._emit({ errorMessage: result.value.toSummary() });
      return;
    }

    await this.loadDashboard();
    this._emit({
      feedbackBanner: authorize
        ? `Consentimento Open Finance reativado para ${result.value.nickname}.`
        : `Consentimento Open Finance revogado para ${result.value.nickname}.`,
    });
  }

  // =========================================================================
  // TABELA 2: EXTRATO & LANÇAMENTOS (`Transaction`)
  // =========================================================================

  public async filterTransactions(
    criteria: TransactionFilterCriteria,
  ): Promise<void> {
    const result = await this._searchTransactions.execute(criteria);
    result.fold(
      (failure) => {
        this._emit({ errorMessage: failure.toSummary() });
      },
      (filtered) => {
        this._emit({
          errorMessage: null,
          filteredTransactions: filtered,
        });
      },
    );
  }

  public async addNewTransaction(props: TransactionProps): Promise<boolean> {
    const result = await this._createTransaction.execute(props);
    if (result.isLeft()) {
      this._emit({ errorMessage: result.value.toSummary() });
      return false;
    }

    await this.loadDashboard();
    this._emit({
      feedbackBanner: `Lançamento "${result.value.title}" registrado e sincronizado na nuvem.`,
    });
    return true;
  }

  public async deleteTransaction(txId: string): Promise<void> {
    const current = this._localDataSource.getTransactions();
    const target = current.find((t) => t.id === txId);
    const remaining = current.filter((t) => t.id !== txId);
    this._localDataSource.saveTransactions(remaining);
    await this.loadDashboard();
    this._emit({
      feedbackBanner: `Lançamento "${target?.title ?? txId}" excluído do extrato.`,
    });
  }

  public exportTransactionsCsv(): string {
    const header = 'ID,Data,Descricao,Instituicao,Categoria,Tipo,Valor_BRL\n';
    const rows = this._state.filteredTransactions.map((tx) => {
      const safeTitle = tx.title.replace(/"/g, '""');
      const signed = tx.type === 'INCOME' ? tx.amount : -tx.amount;
      return `${tx.id},${tx.dateIso},"${safeTitle}",${tx.institution},${tx.category},${tx.type},${signed.toFixed(2)}`;
    });
    return header + rows.join('\n');
  }

  // =========================================================================
  // TABELA 3: CARTÕES DE CRÉDITO & FATURAS (`CreditCardAccount`)
  // =========================================================================

  public addCreditCard(props: CreditCardAccountProps): boolean {
    if (!props.cardName.trim()) {
      this._emit({ errorMessage: 'Informe o nome do cartão corporativo.' });
      return false;
    }
    if (!/^\d{4}$/.test(props.lastFourDigits.trim())) {
      this._emit({
        errorMessage: 'Informe exatamente os 4 últimos dígitos do cartão.',
      });
      return false;
    }
    const card = new CreditCardAccount({
      ...props,
      cardName: props.cardName.trim(),
      lastFourDigits: props.lastFourDigits.trim(),
    });
    const updated = [...this._state.creditCards, card];
    this._localDataSource.saveCreditCards(updated);
    this._emit({
      errorMessage: null,
      creditCards: updated,
      feedbackBanner: `Cartão "${card.cardName} (•••• ${card.lastFourDigits})" adicionado e salvo.`,
    });
    return true;
  }

  public async addCardPurchase(
    cardId: string,
    title: string,
    amount: number,
    category: TransactionCategory,
  ): Promise<boolean> {
    const target = this._state.creditCards.find((c) => c.id === cardId);
    if (!target) {
      return false;
    }
    const updatedCard = new CreditCardAccount(target.toProps());
    const outcome = updatedCard.addPurchase(amount);
    if (outcome.isLeft()) {
      this._emit({ errorMessage: outcome.value.toSummary() });
      return false;
    }

    const updatedCards = this._state.creditCards.map((c) =>
      c.id === cardId ? updatedCard : c,
    );
    this._localDataSource.saveCreditCards(updatedCards);

    await this.addNewTransaction({
      id: `tx-card-${Date.now()}`,
      title: `${title.trim() || 'Compra Cartão'} • ${target.cardName}`,
      amount,
      type: 'EXPENSE',
      category,
      institution: target.institution,
      dateIso: new Date().toISOString().slice(0, 10),
    });

    this._emit({
      creditCards: updatedCards,
      feedbackBanner: `Compra de R$ ${amount.toFixed(2)} lançada na fatura de ${target.cardName}.`,
    });
    return true;
  }

  public async payCardInvoice(cardId: string): Promise<boolean> {
    const target = this._state.creditCards.find((c) => c.id === cardId);
    if (!target) {
      return false;
    }
    const updatedCard = new CreditCardAccount(target.toProps());
    const outcome = updatedCard.payInvoice();
    if (outcome.isLeft()) {
      this._emit({ errorMessage: outcome.value.toSummary() });
      return false;
    }

    const updatedCards = this._state.creditCards.map((c) =>
      c.id === cardId ? updatedCard : c,
    );
    this._localDataSource.saveCreditCards(updatedCards);

    await this.addNewTransaction({
      id: `tx-invoice-${Date.now()}`,
      title: `Pagamento Fatura • ${target.cardName}`,
      amount: outcome.value,
      type: 'EXPENSE',
      category: TransactionCategory.PIX,
      institution: target.institution,
      dateIso: new Date().toISOString().slice(0, 10),
    });

    this._emit({
      creditCards: updatedCards,
      feedbackBanner: `Fatura do cartão ${target.cardName} (R$ ${outcome.value.toFixed(2)}) paga com sucesso.`,
    });
    return true;
  }

  public adjustCardLimit(cardId: string, newTotalLimit: number): boolean {
    const target = this._state.creditCards.find((c) => c.id === cardId);
    if (!target) {
      return false;
    }
    const updatedCard = new CreditCardAccount(target.toProps());
    const outcome = updatedCard.adjustLimit(newTotalLimit);
    if (outcome.isLeft()) {
      this._emit({ errorMessage: outcome.value.toSummary() });
      return false;
    }
    const updatedCards = this._state.creditCards.map((c) =>
      c.id === cardId ? updatedCard : c,
    );
    this._localDataSource.saveCreditCards(updatedCards);
    this._emit({
      errorMessage: null,
      creditCards: updatedCards,
      feedbackBanner: `Limite do cartão ${target.cardName} ajustado para R$ ${newTotalLimit.toFixed(2)}.`,
    });
    return true;
  }

  public deleteCreditCard(cardId: string): void {
    const target = this._state.creditCards.find((c) => c.id === cardId);
    const updatedCards = this._state.creditCards.filter((c) => c.id !== cardId);
    this._localDataSource.saveCreditCards(updatedCards);
    this._emit({
      creditCards: updatedCards,
      feedbackBanner: `Cartão "${target?.cardName ?? cardId}" removido.`,
    });
  }

  // =========================================================================
  // TABELA 4: CENTROS DE CUSTO & METAS DE ORÇAMENTO (`CostCenterBudget`)
  // =========================================================================

  public addCostCenter(props: CostCenterBudgetProps): boolean {
    if (!props.costCenterName.trim()) {
      this._emit({ errorMessage: 'Informe o nome do Centro de Custo.' });
      return false;
    }
    const budget = new CostCenterBudget({
      ...props,
      costCenterName: props.costCenterName.trim(),
      responsibleArea: props.responsibleArea.trim() || 'Diretoria Financeira',
    });
    const check = budget.updateThresholds(
      props.thresholds[0],
      props.thresholds[1],
    );
    if (check.isLeft()) {
      this._emit({ errorMessage: check.value.toSummary() });
      return false;
    }
    const updated = [...this._state.costCenters, budget];
    this._localDataSource.saveCostCenters(updated);
    this._emit({
      errorMessage: null,
      costCenters: updated,
      feedbackBanner: `Centro de Custo "${budget.costCenterName}" cadastrado com sucesso.`,
    });
    return true;
  }

  public updateCostCenterThresholds(
    budgetId: string,
    newIdeal: number,
    newCeiling: number,
  ): boolean {
    const target = this._state.costCenters.find((b) => b.id === budgetId);
    if (!target) {
      return false;
    }
    const updated = new CostCenterBudget(target.toProps());
    const outcome = updated.updateThresholds(newIdeal, newCeiling);
    if (outcome.isLeft()) {
      this._emit({ errorMessage: outcome.value.toSummary() });
      return false;
    }
    const updatedList = this._state.costCenters.map((b) =>
      b.id === budgetId ? updated : b,
    );
    this._localDataSource.saveCostCenters(updatedList);
    this._emit({
      errorMessage: null,
      costCenters: updatedList,
      feedbackBanner: `Meta do centro de custo "${target.costCenterName}" atualizada para [Ideal: R$ ${newIdeal.toFixed(2)}, Teto: R$ ${newCeiling.toFixed(2)}].`,
    });
    return true;
  }

  public deleteCostCenter(budgetId: string): void {
    const target = this._state.costCenters.find((b) => b.id === budgetId);
    const updatedList = this._state.costCenters.filter((b) => b.id !== budgetId);
    this._localDataSource.saveCostCenters(updatedList);
    this._emit({
      costCenters: updatedList,
      feedbackBanner: `Centro de custo "${target?.costCenterName ?? budgetId}" removido.`,
    });
  }

  // =========================================================================
  // TABELA 5: RADAR DE ASSINATURAS & CONTRATOS RECORRENTES (`RecurringSubscription`)
  // =========================================================================

  public addSubscription(props: RecurringSubscriptionProps): boolean {
    if (!props.serviceName.trim() || props.monthlyAmount <= 0) {
      this._emit({
        errorMessage: 'Informe o nome do serviço e um valor mensal positivo.',
      });
      return false;
    }
    const sub = new RecurringSubscription({
      ...props,
      serviceName: props.serviceName.trim(),
    });
    const updated = [sub, ...this._state.subscriptions];
    this._localDataSource.saveSubscriptions(updated);
    this._emit({
      errorMessage: null,
      subscriptions: updated,
      feedbackBanner: `Assinatura recorrente "${sub.serviceName}" adicionada ao radar.`,
    });
    return true;
  }

  public toggleSubscriptionStatus(subId: string): void {
    const target = this._state.subscriptions.find((s) => s.id === subId);
    if (!target) {
      return;
    }
    const updated = new RecurringSubscription(target.toProps());
    if (updated.status === 'DUPLICATE_ALERT') {
      updated.resolveDuplicate();
    } else {
      updated.togglePause();
    }
    const updatedList = this._state.subscriptions.map((s) =>
      s.id === subId ? updated : s,
    );
    this._localDataSource.saveSubscriptions(updatedList);
    this._emit({
      subscriptions: updatedList,
      feedbackBanner: `Status da assinatura "${target.serviceName}" atualizado para ${updated.status}.`,
    });
  }

  public deleteSubscription(subId: string): void {
    const target = this._state.subscriptions.find((s) => s.id === subId);
    const updatedList = this._state.subscriptions.filter((s) => s.id !== subId);
    this._localDataSource.saveSubscriptions(updatedList);
    this._emit({
      subscriptions: updatedList,
      feedbackBanner: `Assinatura "${target?.serviceName ?? subId}" removida.`,
    });
  }

  // =========================================================================
  // TABELA 6: CHAVES PIX & CENTRAL PIX ASAAS (`RegisteredPixKey`)
  // =========================================================================

  public registerPixKey(props: RegisteredPixKeyProps): boolean {
    const validated = RegisteredPixKey.createValidated(props);
    if (validated.isLeft()) {
      this._emit({ errorMessage: validated.value.toSummary() });
      return false;
    }
    const updated = [validated.value, ...this._state.pixKeys];
    this._localDataSource.savePixKeys(updated);
    this._emit({
      errorMessage: null,
      pixKeys: updated,
      feedbackBanner: `Chave PIX (${validated.value.keyType}) registrada e salva no seu perfil.`,
    });
    return true;
  }

  public deletePixKey(keyId: string): void {
    const target = this._state.pixKeys.find((k) => k.id === keyId);
    const updated = this._state.pixKeys.filter((k) => k.id !== keyId);
    this._localDataSource.savePixKeys(updated);
    this._emit({
      pixKeys: updated,
      feedbackBanner: `Chave PIX "${target?.label ?? keyId}" removida.`,
    });
  }

  public async generatePixQrCode(
    amount: number,
    description: string,
  ): Promise<boolean> {
    this._emit({ errorMessage: null });
    const result = await this._createPixCharge.execute({ amount, description });

    return result.fold(
      (failure) => {
        this._emit({ errorMessage: failure.toSummary() });
        return false;
      },
      (charge) => {
        this._emit({
          activePixCharge: charge,
          feedbackBanner: `QR Code PIX de R$ ${charge.amount.toFixed(2)} emitido via ${charge.provider}.`,
        });
        return true;
      },
    );
  }

  public async sendPixTransfer(request: PixTransferRequest): Promise<boolean> {
    this._emit({ errorMessage: null });
    const result = await this._executePixTransfer.execute(request);

    if (result.isLeft()) {
      this._emit({ errorMessage: result.value.toSummary() });
      return false;
    }

    await this.loadDashboard();
    this._emit({
      lastPixReceipt: result.value,
      feedbackBanner: `PIX de R$ ${result.value.amount.toFixed(2)} enviado para ${result.value.recipientName} (${result.value.endToEndId}).`,
    });
    return true;
  }

  // =========================================================================
  // ASSISTENTE PIERRE IA, FLAVORS & RESTAURAÇÃO DE CENÁRIO
  // =========================================================================

  public askAssistant(question: string): void {
    const trimmed = question.trim();
    if (!trimmed || !this._state.summary) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: trimmed,
      timestampIso: new Date().toISOString(),
    };

    const replyText = PierreFinancialEngine.answerNaturalLanguageQuery(
      trimmed,
      this._state.summary,
      this._state.transactions,
    );

    const botMsg: AssistantMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'PIERRE_AI',
      text: replyText,
      timestampIso: new Date().toISOString(),
    };

    this._emit({
      assistantHistory: [...this._state.assistantHistory, userMsg, botMsg],
    });
  }

  public switchFlavor(flavor: AppFlavor): void {
    FlavorConfig.switchFlavor(flavor);
    this._emit({
      activeFlavor: flavor,
      feedbackBanner: `Ambiente alterado para Flavor.${flavor} (${FlavorConfig.getProfile().gateway.mode}).`,
    });
  }

  public async resetDemoData(): Promise<void> {
    if (this._resetSeedCallback) {
      this._resetSeedCallback();
    } else {
      this._localDataSource.resetToSeed();
    }
    await this.loadDashboard();
    this._emit({
      activePixCharge: null,
      lastPixReceipt: null,
      feedbackBanner:
        'Todas as 6 tabelas foram restauradas para o cenário de demonstração e sincronizadas.',
    });
  }

  /**
   * Zera completamente a conta do usuário (Saldo R$ 0,00, sem transações ou cartões residuais)
   * e persiste o estado limpo no Cloud Firestore.
   */
  public async resetAccountToZero(): Promise<void> {
    this._localDataSource.resetToZero();
    await this.loadDashboard();
    this._emit({
      activePixCharge: null,
      lastPixReceipt: null,
      feedbackBanner:
        'Sua conta foi iniciada do zero com sucesso! Saldo R$ 0,00 e sincronizada no Cloud Firestore.',
    });
  }
}

/**
 * Fábrica de Injeção de Dependências (equivalente ao `app_module.dart` do App_Nasa).
 */
export function createFinanceViewModel(): FinanceViewModel {
  const localDataSource = new FinanceLocalDataSourceImpl();
  const pixDataSource = new PixGatewayDataSourceImpl();
  const connectionChecker = new BrowserConnectionChecker();

  const transactionRepo = new TransactionRepositoryImpl(
    localDataSource,
    connectionChecker,
  );
  const openFinanceRepo = new OpenFinanceRepositoryImpl(
    localDataSource,
    connectionChecker,
  );
  const pixGatewayRepo = new PixGatewayRepositoryImpl(
    pixDataSource,
    connectionChecker,
  );

  return new FinanceViewModel(
    new GetDashboardSnapshotUseCase(openFinanceRepo, transactionRepo),
    new SearchTransactionsUseCase(transactionRepo),
    new CreateTransactionUseCase(transactionRepo),
    new SyncOpenFinanceInstitutionUseCase(openFinanceRepo),
    new ToggleOpenFinanceConsentUseCase(openFinanceRepo),
    new CreatePixChargeUseCase(pixGatewayRepo),
    new ExecutePixTransferUseCase(pixGatewayRepo, transactionRepo),
    () => localDataSource.resetToSeed(),
    localDataSource,
  );
}
