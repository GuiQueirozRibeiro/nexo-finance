/**
 * DataSource Local com suporte híbrido (localStorage no navegador e memória no Node/Vitest),
 * inspirado em core/lib/src/services/media/data/datasources/media_local_data_source.dart do App_Nasa.
 */

import { CacheException, safeJsonParse } from '@/core';
import { BankAccountModel } from '../models/bank-account.model';
import { TransactionModel } from '../models/transaction.model';
import { INITIAL_BANK_ACCOUNTS, INITIAL_TRANSACTIONS } from './seed-data';

const ACCOUNTS_STORAGE_KEY = 'nexo_finance_accounts_v1';
const TRANSACTIONS_STORAGE_KEY = 'nexo_finance_transactions_v1';

export interface IFinanceLocalDataSource {
  getAccounts(): BankAccountModel[];
  saveAccounts(accounts: readonly BankAccountModel[]): void;
  getTransactions(): TransactionModel[];
  saveTransactions(transactions: readonly TransactionModel[]): void;
  resetToSeed(): void;
}

export class FinanceLocalDataSourceImpl implements IFinanceLocalDataSource {
  private static _memoryAccounts: BankAccountModel[] | null = null;
  private static _memoryTransactions: TransactionModel[] | null = null;

  private _hasBrowserStorage(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    );
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
            if (modelEither.isRight()) {
              validModels.push(modelEither.value);
            }
          }
          if (validModels.length > 0) {
            return validModels;
          }
        }
      }
      const seeded = INITIAL_BANK_ACCOUNTS.map(
        (props) => new BankAccountModel(props),
      );
      this.saveAccounts(seeded);
      return seeded;
    }

    if (!FinanceLocalDataSourceImpl._memoryAccounts) {
      FinanceLocalDataSourceImpl._memoryAccounts = INITIAL_BANK_ACCOUNTS.map(
        (props) => new BankAccountModel(props),
      );
    }
    return [...FinanceLocalDataSourceImpl._memoryAccounts];
  }

  public saveAccounts(accounts: readonly BankAccountModel[]): void {
    try {
      FinanceLocalDataSourceImpl._memoryAccounts = [...accounts];
      if (this._hasBrowserStorage()) {
        const serialized = JSON.stringify(accounts.map((acc) => acc.toJson()));
        window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, serialized);
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
            if (modelEither.isRight()) {
              validModels.push(modelEither.value);
            }
          }
          if (validModels.length > 0) {
            return validModels;
          }
        }
      }
      const seeded = INITIAL_TRANSACTIONS.map(
        (props) => new TransactionModel(props),
      );
      this.saveTransactions(seeded);
      return seeded;
    }

    if (!FinanceLocalDataSourceImpl._memoryTransactions) {
      FinanceLocalDataSourceImpl._memoryTransactions = INITIAL_TRANSACTIONS.map(
        (props) => new TransactionModel(props),
      );
    }
    return [...FinanceLocalDataSourceImpl._memoryTransactions];
  }

  public saveTransactions(transactions: readonly TransactionModel[]): void {
    try {
      FinanceLocalDataSourceImpl._memoryTransactions = [...transactions];
      if (this._hasBrowserStorage()) {
        const serialized = JSON.stringify(
          transactions.map((tx) => tx.toJson()),
        );
        window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, serialized);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Erro ao salvar transações.';
      throw new CacheException(msg, TRANSACTIONS_STORAGE_KEY);
    }
  }

  public resetToSeed(): void {
    FinanceLocalDataSourceImpl._memoryAccounts = INITIAL_BANK_ACCOUNTS.map(
      (props) => new BankAccountModel(props),
    );
    FinanceLocalDataSourceImpl._memoryTransactions = INITIAL_TRANSACTIONS.map(
      (props) => new TransactionModel(props),
    );
    if (this._hasBrowserStorage()) {
      this.saveAccounts(FinanceLocalDataSourceImpl._memoryAccounts);
      this.saveTransactions(FinanceLocalDataSourceImpl._memoryTransactions);
    }
  }
}
