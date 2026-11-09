/**
 * FinanceViewModel — Camada Presentation / MVVM (inspirado em MediaProvider do App_Nasa).
 *
 * 100% TypeScript puro (sem dependência de React), permitindo testar toda a gestão de estado
 * em testes unitários Node/Vitest.
 *
 * Princípios aplicados:
 * - MVVM: expõe estado imutável (DeepReadonly) e comandos assíncronos para a View.
 * - DIP (SOLID): recebe os UseCases injetados no construtor.
 * - Encapsulamento OOP: estado interno privado (`private _state`) e lista de observadores (`private readonly _listeners`).
 */

import {
  type AppFlavor,
  BrowserConnectionChecker,
  type DeepReadonly,
  FlavorConfig,
  type InstitutionCode,
  NoParams,
} from '@/core';
import {
  FinanceLocalDataSourceImpl,
  OpenFinanceRepositoryImpl,
  PixGatewayDataSourceImpl,
  PixGatewayRepositoryImpl,
  TransactionRepositoryImpl,
} from '@/data';
import {
  type BankAccount,
  CreatePixChargeUseCase,
  CreateTransactionUseCase,
  type DashboardSummary,
  ExecutePixTransferUseCase,
  GetDashboardSnapshotUseCase,
  PierreFinancialEngine,
  type PixChargeEntity,
  type PixTransferReceipt,
  type PixTransferRequest,
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
  readonly errorMessage: string | null;
  readonly feedbackBanner: string | null;
  readonly activeFlavor: AppFlavor;
  readonly accounts: readonly BankAccount[];
  readonly transactions: readonly Transaction[];
  readonly filteredTransactions: readonly Transaction[];
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

  public constructor(
    private readonly _getDashboardSnapshot: GetDashboardSnapshotUseCase,
    private readonly _searchTransactions: SearchTransactionsUseCase,
    private readonly _createTransaction: CreateTransactionUseCase,
    private readonly _syncOpenFinance: SyncOpenFinanceInstitutionUseCase,
    private readonly _toggleConsent: ToggleOpenFinanceConsentUseCase,
    private readonly _createPixCharge: CreatePixChargeUseCase,
    private readonly _executePixTransfer: ExecutePixTransferUseCase,
    private readonly _resetSeedCallback?: () => void,
  ) {
    this._state = {
      isLoading: true,
      errorMessage: null,
      feedbackBanner: null,
      activeFlavor: FlavorConfig.currentFlavor,
      accounts: [],
      transactions: [],
      filteredTransactions: [],
      summary: null,
      activePixCharge: null,
      lastPixReceipt: null,
      assistantHistory: [
        {
          id: 'msg-welcome',
          sender: 'PIERRE_AI',
          text: 'Olá, Guilherme! Sou o assistente Nexo IA (inspirado no Pierre). Suas 4 contas Open Finance e Asaas estão sincronizadas. Pergunte sobre "assinaturas", "cobranças duplicadas", "saldo" ou "maior gasto".',
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
          summary: snapshot.summary,
        });
      },
    );
  }

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
      feedbackBanner: `Lançamento "${result.value.title}" registrado com sucesso.`,
    });
    return true;
  }

  public async syncInstitution(institution: InstitutionCode): Promise<void> {
    this._emit({ isLoading: true, errorMessage: null });
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
    }
    await this.loadDashboard();
    this._emit({
      activePixCharge: null,
      lastPixReceipt: null,
      feedbackBanner: 'Dados restaurados para o cenário padrão da demonstração.',
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
  );
}
