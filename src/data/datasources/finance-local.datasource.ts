/**
 * DataSource Híbrido (localStorage + Cloud Firestore em tempo real + memória Node/Vitest),
 * persistindo todas as 6 tabelas relacionais do Nexo Finance:
 * 1. accounts (`BankAccountModel`)
 * 2. transactions (`TransactionModel`)
 * 3. creditCards (`CreditCardAccount`)
 * 4. costCenters (`CostCenterBudget`)
 * 5. subscriptions (`RecurringSubscription`)
 * 6. pixKeys (`RegisteredPixKey`)
 *
 * IMPORTANTE (Política de Banco Real):
 * - No navegador (produção), contas novas ou limpas iniciam 100% zeradas (`R$ 0,00`,
 *   `0` transações, `0` cartões, `0` assinaturas, `0` centros de custo e `0` chaves PIX).
 * - Os dados de `seed-data.ts` só são carregados quando `resetToSeed()` é invocado
 *   explicitamente pela suíte de testes automatizados (Vitest).
 */

import {
  CacheException,
  FirebaseClientManager,
  InstitutionCode,
  isPlainRecord,
  safeJsonParse,
} from '@/core';
import {
  CostCenterBudget,
  type CostCenterBudgetProps,
  CreditCardAccount,
  type CreditCardAccountProps,
  RecurringSubscription,
  type RecurringSubscriptionProps,
  RegisteredPixKey,
  type RegisteredPixKeyProps,
} from '@/domain';
import { BankAccountModel } from '../models/bank-account.model';
import { TransactionModel } from '../models/transaction.model';
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_COST_CENTERS,
  INITIAL_CREDIT_CARDS,
  INITIAL_PIX_KEYS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from './seed-data';

const ACCOUNTS_STORAGE_KEY = 'nexo_finance_accounts_v3';
const TRANSACTIONS_STORAGE_KEY = 'nexo_finance_transactions_v3';
const CARDS_STORAGE_KEY = 'nexo_finance_cards_v3';
const COSTS_STORAGE_KEY = 'nexo_finance_costs_v3';
const SUBS_STORAGE_KEY = 'nexo_finance_subs_v3';
const PIXKEYS_STORAGE_KEY = 'nexo_finance_pixkeys_v3';

// IDs sintéticos legados que nunca devem contaminar contas reais no navegador ou Firestore
const LEGACY_SYNTHETIC_IDS = new Set<string>([
  'acc-asaas-eximia',
  'acc-nubank-pf',
  'acc-itau-personnalite',
  'acc-inter-global',
  'tx-101',
  'tx-102',
  'tx-103',
  'tx-104',
  'tx-105',
  'tx-106',
  'tx-107',
  'tx-108',
  'tx-109',
  'card-nubank-uv',
  'card-itau-pers',
  'card-inter-black',
  'cc-housing',
  'cc-food',
  'cc-subs',
  'cc-transport',
  'cc-investments',
  'cost-housing',
  'cost-food',
  'cost-transport',
  'cost-subs',
  'sub-vercel',
  'sub-ai',
  'sub-spotify-1',
  'sub-spotify-2',
  'sub-fibra',
  'pk-email',
  'pk-phone',
  'pk-cpf',
  'pk-evp',
]);

function createCleanPrimaryAccount(): BankAccountModel {
  return new BankAccountModel({
    id: 'acc-nexo-primary',
    institution: InstitutionCode.ASAAS,
    nickname: 'Nexo Conta Digital (Asaas)',
    balance: 0,
    coordinates: ['461', '0001', '1001-0'],
    consentStatus: 'AUTHORIZED',
    lastSyncIso: new Date().toISOString(),
    colorAccentHex: '#ff5500',
  });
}

export interface IFinanceLocalDataSource {
  getAccounts(): BankAccountModel[];
  saveAccounts(accounts: readonly BankAccountModel[]): void;
  getTransactions(): TransactionModel[];
  saveTransactions(transactions: readonly TransactionModel[]): void;
  getCreditCards(): CreditCardAccount[];
  saveCreditCards(cards: readonly CreditCardAccount[]): void;
  getCostCenters(): CostCenterBudget[];
  saveCostCenters(centers: readonly CostCenterBudget[]): void;
  getSubscriptions(): RecurringSubscription[];
  saveSubscriptions(subs: readonly RecurringSubscription[]): void;
  getPixKeys(): RegisteredPixKey[];
  savePixKeys(keys: readonly RegisteredPixKey[]): void;
  syncFromFirestore(): Promise<boolean>;
  resetToSeed(): void;
  resetToZero(): void;
}

export class FinanceLocalDataSourceImpl implements IFinanceLocalDataSource {
  private static _memoryAccounts: BankAccountModel[] | null = null;
  private static _memoryTransactions: TransactionModel[] | null = null;
  private static _memoryCards: CreditCardAccount[] | null = null;
  private static _memoryCosts: CostCenterBudget[] | null = null;
  private static _memorySubs: RecurringSubscription[] | null = null;
  private static _memoryPixKeys: RegisteredPixKey[] | null = null;

  private _hasBrowserStorage(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    );
  }

  private _pushAllToFirestore(): void {
    if (!this._hasBrowserStorage()) {
      return;
    }
    const accountsJson = this.getAccounts().map((a) => a.toJson());
    const transactionsJson = this.getTransactions().map((t) => t.toJson());
    const cardsJson = this.getCreditCards().map((c) => c.toProps());
    const costsJson = this.getCostCenters().map((c) => c.toProps());
    const subsJson = this.getSubscriptions().map((s) => s.toProps());
    const pixKeysJson = this.getPixKeys().map((p) => p.toProps());

    void FirebaseClientManager.saveFullSnapshotToFirestore({
      accounts: accountsJson,
      transactions: transactionsJson,
      creditCards: cardsJson,
      costCenters: costsJson,
      subscriptions: subsJson,
      pixKeys: pixKeysJson,
    });
  }

  public getAccounts(): BankAccountModel[] {
    if (this._hasBrowserStorage()) {
      const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsedEither = safeJsonParse(raw);
        if (parsedEither.isRight() && Array.isArray(parsedEither.value)) {
          const validModels: BankAccountModel[] = [];
          for (const item of parsedEither.value) {
            const modelEither = BankAccountModel.fromUnknown(item);
            if (
              modelEither.isRight() &&
              !LEGACY_SYNTHETIC_IDS.has(modelEither.value.id)
            ) {
              validModels.push(modelEither.value);
            }
          }
          if (validModels.length > 0) {
            FinanceLocalDataSourceImpl._memoryAccounts = validModels;
            return validModels;
          }
        }
      }
      const clean = [createCleanPrimaryAccount()];
      window.localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(clean.map((a) => a.toJson())),
      );
      FinanceLocalDataSourceImpl._memoryAccounts = clean;
      return clean;
    }

    if (!FinanceLocalDataSourceImpl._memoryAccounts) {
      FinanceLocalDataSourceImpl._memoryAccounts = [createCleanPrimaryAccount()];
    }
    return [...FinanceLocalDataSourceImpl._memoryAccounts];
  }

  public saveAccounts(accounts: readonly BankAccountModel[]): void {
    try {
      FinanceLocalDataSourceImpl._memoryAccounts = [...accounts];
      if (this._hasBrowserStorage()) {
        const jsonList = accounts.map((acc) => acc.toJson());
        window.localStorage.setItem(
          ACCOUNTS_STORAGE_KEY,
          JSON.stringify(jsonList),
        );
        this._pushAllToFirestore();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Erro ao salvar contas.';
      throw new CacheException(msg, ACCOUNTS_STORAGE_KEY);
    }
  }

  public getTransactions(): TransactionModel[] {
    if (this._hasBrowserStorage()) {
      const raw = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (raw) {
        const parsedEither = safeJsonParse(raw);
        if (parsedEither.isRight() && Array.isArray(parsedEither.value)) {
          const validModels: TransactionModel[] = [];
          for (const item of parsedEither.value) {
            const modelEither = TransactionModel.fromUnknown(item);
            if (
              modelEither.isRight() &&
              !LEGACY_SYNTHETIC_IDS.has(modelEither.value.id)
            ) {
              validModels.push(modelEither.value);
            }
          }
          FinanceLocalDataSourceImpl._memoryTransactions = validModels;
          return validModels;
        }
      }
      window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify([]));
      FinanceLocalDataSourceImpl._memoryTransactions = [];
      return [];
    }

    if (!FinanceLocalDataSourceImpl._memoryTransactions) {
      FinanceLocalDataSourceImpl._memoryTransactions = [];
    }
    return [...FinanceLocalDataSourceImpl._memoryTransactions];
  }

  public saveTransactions(transactions: readonly TransactionModel[]): void {
    try {
      FinanceLocalDataSourceImpl._memoryTransactions = [...transactions];
      if (this._hasBrowserStorage()) {
        const jsonList = transactions.map((tx) => tx.toJson());
        window.localStorage.setItem(
          TRANSACTIONS_STORAGE_KEY,
          JSON.stringify(jsonList),
        );
        this._pushAllToFirestore();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Erro ao salvar transações.';
      throw new CacheException(msg, TRANSACTIONS_STORAGE_KEY);
    }
  }

  public getCreditCards(): CreditCardAccount[] {
    if (this._hasBrowserStorage()) {
      const raw = window.localStorage.getItem(CARDS_STORAGE_KEY);
      if (raw) {
        const parsed = safeJsonParse(raw);
        if (parsed.isRight() && Array.isArray(parsed.value)) {
          const cards: CreditCardAccount[] = [];
          for (const item of parsed.value) {
            if (
              isPlainRecord(item) &&
              typeof item.id === 'string' &&
              !LEGACY_SYNTHETIC_IDS.has(item.id)
            ) {
              cards.push(
                new CreditCardAccount(item as unknown as CreditCardAccountProps),
              );
            }
          }
          FinanceLocalDataSourceImpl._memoryCards = cards;
          return cards;
        }
      }
      window.localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify([]));
      FinanceLocalDataSourceImpl._memoryCards = [];
      return [];
    }
    if (!FinanceLocalDataSourceImpl._memoryCards) {
      FinanceLocalDataSourceImpl._memoryCards = [];
    }
    return [...FinanceLocalDataSourceImpl._memoryCards];
  }

  public saveCreditCards(cards: readonly CreditCardAccount[]): void {
    FinanceLocalDataSourceImpl._memoryCards = [...cards];
    if (this._hasBrowserStorage()) {
      window.localStorage.setItem(
        CARDS_STORAGE_KEY,
        JSON.stringify(cards.map((c) => c.toProps())),
      );
      this._pushAllToFirestore();
    }
  }

  public getCostCenters(): CostCenterBudget[] {
    if (this._hasBrowserStorage()) {
      const raw = window.localStorage.getItem(COSTS_STORAGE_KEY);
      if (raw) {
        const parsed = safeJsonParse(raw);
        if (parsed.isRight() && Array.isArray(parsed.value)) {
          const centers: CostCenterBudget[] = [];
          for (const item of parsed.value) {
            if (
              isPlainRecord(item) &&
              typeof item.id === 'string' &&
              !LEGACY_SYNTHETIC_IDS.has(item.id)
            ) {
              centers.push(
                new CostCenterBudget(item as unknown as CostCenterBudgetProps),
              );
            }
          }
          FinanceLocalDataSourceImpl._memoryCosts = centers;
          return centers;
        }
      }
      window.localStorage.setItem(COSTS_STORAGE_KEY, JSON.stringify([]));
      FinanceLocalDataSourceImpl._memoryCosts = [];
      return [];
    }
    if (!FinanceLocalDataSourceImpl._memoryCosts) {
      FinanceLocalDataSourceImpl._memoryCosts = [];
    }
    return [...FinanceLocalDataSourceImpl._memoryCosts];
  }

  public saveCostCenters(centers: readonly CostCenterBudget[]): void {
    FinanceLocalDataSourceImpl._memoryCosts = [...centers];
    if (this._hasBrowserStorage()) {
      window.localStorage.setItem(
        COSTS_STORAGE_KEY,
        JSON.stringify(centers.map((c) => c.toProps())),
      );
      this._pushAllToFirestore();
    }
  }

  public getSubscriptions(): RecurringSubscription[] {
    if (this._hasBrowserStorage()) {
      const raw = window.localStorage.getItem(SUBS_STORAGE_KEY);
      if (raw) {
        const parsed = safeJsonParse(raw);
        if (parsed.isRight() && Array.isArray(parsed.value)) {
          const subs: RecurringSubscription[] = [];
          for (const item of parsed.value) {
            if (
              isPlainRecord(item) &&
              typeof item.id === 'string' &&
              !LEGACY_SYNTHETIC_IDS.has(item.id)
            ) {
              subs.push(
                new RecurringSubscription(
                  item as unknown as RecurringSubscriptionProps,
                ),
              );
            }
          }
          FinanceLocalDataSourceImpl._memorySubs = subs;
          return subs;
        }
      }
      window.localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify([]));
      FinanceLocalDataSourceImpl._memorySubs = [];
      return [];
    }
    if (!FinanceLocalDataSourceImpl._memorySubs) {
      FinanceLocalDataSourceImpl._memorySubs = [];
    }
    return [...FinanceLocalDataSourceImpl._memorySubs];
  }

  public saveSubscriptions(subs: readonly RecurringSubscription[]): void {
    FinanceLocalDataSourceImpl._memorySubs = [...subs];
    if (this._hasBrowserStorage()) {
      window.localStorage.setItem(
        SUBS_STORAGE_KEY,
        JSON.stringify(subs.map((s) => s.toProps())),
      );
      this._pushAllToFirestore();
    }
  }

  public getPixKeys(): RegisteredPixKey[] {
    if (this._hasBrowserStorage()) {
      const raw = window.localStorage.getItem(PIXKEYS_STORAGE_KEY);
      if (raw) {
        const parsed = safeJsonParse(raw);
        if (parsed.isRight() && Array.isArray(parsed.value)) {
          const keys: RegisteredPixKey[] = [];
          for (const item of parsed.value) {
            if (
              isPlainRecord(item) &&
              typeof item.id === 'string' &&
              !LEGACY_SYNTHETIC_IDS.has(item.id)
            ) {
              keys.push(
                new RegisteredPixKey(item as unknown as RegisteredPixKeyProps),
              );
            }
          }
          FinanceLocalDataSourceImpl._memoryPixKeys = keys;
          return keys;
        }
      }
      window.localStorage.setItem(PIXKEYS_STORAGE_KEY, JSON.stringify([]));
      FinanceLocalDataSourceImpl._memoryPixKeys = [];
      return [];
    }
    if (!FinanceLocalDataSourceImpl._memoryPixKeys) {
      FinanceLocalDataSourceImpl._memoryPixKeys = [];
    }
    return [...FinanceLocalDataSourceImpl._memoryPixKeys];
  }

  public savePixKeys(keys: readonly RegisteredPixKey[]): void {
    FinanceLocalDataSourceImpl._memoryPixKeys = [...keys];
    if (this._hasBrowserStorage()) {
      window.localStorage.setItem(
        PIXKEYS_STORAGE_KEY,
        JSON.stringify(keys.map((k) => k.toProps())),
      );
      this._pushAllToFirestore();
    }
  }

  /**
   * Hidrata o armazenamento local a partir do Cloud Firestore (`users/{uid}/finance/snapshot`),
   * filtrando qualquer dado sintético antigo, ou inicializa 100% zerado no primeiro acesso.
   */
  public async syncFromFirestore(): Promise<boolean> {
    if (!this._hasBrowserStorage()) {
      return false;
    }
    const cloudSnap =
      await FirebaseClientManager.loadUserSnapshotFromFirestore();
    if (!cloudSnap) {
      this.resetToZero();
      return true;
    }

    const filterRealRecords = (items: readonly unknown[] | undefined) => {
      if (!Array.isArray(items)) return [];
      return items.filter(
        (item) =>
          isPlainRecord(item) &&
          typeof item.id === 'string' &&
          !LEGACY_SYNTHETIC_IDS.has(item.id),
      );
    };

    const realAccounts = filterRealRecords(cloudSnap.accounts);
    const realTransactions = filterRealRecords(cloudSnap.transactions);
    const realCards = filterRealRecords(cloudSnap.creditCards);
    const realCosts = filterRealRecords(cloudSnap.costCenters);
    const realSubs = filterRealRecords(cloudSnap.subscriptions);
    const realPixKeys = filterRealRecords(cloudSnap.pixKeys);

    const accountsToStore =
      realAccounts.length > 0
        ? realAccounts
        : [createCleanPrimaryAccount().toJson()];

    window.localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(accountsToStore),
    );
    window.localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify(realTransactions),
    );
    window.localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(realCards));
    window.localStorage.setItem(COSTS_STORAGE_KEY, JSON.stringify(realCosts));
    window.localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(realSubs));
    window.localStorage.setItem(
      PIXKEYS_STORAGE_KEY,
      JSON.stringify(realPixKeys),
    );

    // Persiste o snapshot limpo de volta na nuvem caso houvesse lixo sintético antigo
    this._pushAllToFirestore();
    return true;
  }

  public resetToZero(): void {
    const cleanAccount = createCleanPrimaryAccount();

    FinanceLocalDataSourceImpl._memoryAccounts = [cleanAccount];
    FinanceLocalDataSourceImpl._memoryTransactions = [];
    FinanceLocalDataSourceImpl._memoryCards = [];
    FinanceLocalDataSourceImpl._memoryCosts = [];
    FinanceLocalDataSourceImpl._memorySubs = [];
    FinanceLocalDataSourceImpl._memoryPixKeys = [];

    if (this._hasBrowserStorage()) {
      window.localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify([cleanAccount.toJson()]),
      );
      window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.setItem(COSTS_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.setItem(PIXKEYS_STORAGE_KEY, JSON.stringify([]));
      this._pushAllToFirestore();
    }
  }

  public resetToSeed(): void {
    FinanceLocalDataSourceImpl._memoryAccounts = INITIAL_BANK_ACCOUNTS.map(
      (props) => new BankAccountModel(props),
    );
    FinanceLocalDataSourceImpl._memoryTransactions = INITIAL_TRANSACTIONS.map(
      (props) => new TransactionModel(props),
    );
    FinanceLocalDataSourceImpl._memoryCards = INITIAL_CREDIT_CARDS.map(
      (props) => new CreditCardAccount(props),
    );
    FinanceLocalDataSourceImpl._memoryCosts = INITIAL_COST_CENTERS.map(
      (props) => new CostCenterBudget(props),
    );
    FinanceLocalDataSourceImpl._memorySubs = INITIAL_SUBSCRIPTIONS.map(
      (props) => new RecurringSubscription(props),
    );
    FinanceLocalDataSourceImpl._memoryPixKeys = INITIAL_PIX_KEYS.map(
      (props) => new RegisteredPixKey(props),
    );
  }
}
