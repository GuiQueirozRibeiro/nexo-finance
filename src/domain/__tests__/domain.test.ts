import { describe, expect, it } from 'vitest';
import { InstitutionCode, TransactionCategory } from '@/core';
import {
  BankAccount,
  PierreFinancialEngine,
  PixKeyValidator,
  Transaction,
} from '../index';

describe('Domain Layer — Entities OOP, Tuplas e Regras de Negócio', () => {
  it('deve validar criação de Transaction e calcular saldo líquido com operador rest (...items)', () => {
    const incomeEither = Transaction.validateProps({
      id: 'tx-1',
      title: 'Consultoria Exímia Tech',
      amount: 12000,
      type: 'INCOME',
      category: TransactionCategory.SALARY,
      institution: InstitutionCode.ASAAS,
      dateIso: '2026-11-05',
    });

    const expenseEither = Transaction.validateProps({
      id: 'tx-2',
      title: 'Servidor Cloud AWS',
      amount: 850,
      type: 'EXPENSE',
      category: TransactionCategory.SUBSCRIPTIONS,
      institution: InstitutionCode.NUBANK,
      dateIso: '2026-11-06',
      isRecurring: true,
    });

    expect(incomeEither.isRight()).toBe(true);
    expect(expenseEither.isRight()).toBe(true);

    if (incomeEither.isRight() && expenseEither.isRight()) {
      const net = Transaction.calculateNetBalance(
        incomeEither.value,
        expenseEither.value,
      );
      expect(net).toBe(11150);
    }

    const invalidTx = Transaction.validateProps({
      id: 'tx-err',
      title: 'A',
      amount: -50,
      type: 'EXPENSE',
      category: TransactionCategory.FOOD,
      institution: InstitutionCode.ITAU,
      dateIso: '2026-11-06',
    });
    expect(invalidTx.isLeft()).toBe(true);
  });

  it('deve encapsular saldo e tupla de coordenadas em BankAccount respeitando consentimento Open Finance', () => {
    const account = new BankAccount({
      id: 'acc-nubank',
      institution: InstitutionCode.NUBANK,
      nickname: 'NuConta Principal',
      balance: 5000,
      coordinates: ['260', '0001', '98421-3'],
      consentStatus: 'AUTHORIZED',
      lastSyncIso: '2026-11-09T10:00:00Z',
      colorAccentHex: '#8A05BE',
    });

    expect(account.formattedCoordinates).toBe(
      'Banco 260 • Ag. 0001 • Cc. 98421-3',
    );
    expect(account.debit(1200).isRight()).toBe(true);
    expect(account.balance).toBe(3800);

    account.revokeConsent();
    expect(account.isAuthorized).toBe(false);
    expect(account.credit(500).isLeft()).toBe(true);
  });

  it('deve validar chaves PIX de forma exaustiva em PixKeyValidator', () => {
    expect(PixKeyValidator.validate('CPF', '123.456.789-01').isRight()).toBe(true);
    expect(PixKeyValidator.validate('CPF', '12345').isLeft()).toBe(true);
    expect(
      PixKeyValidator.validate('EMAIL', 'Financeiro@EximiaTech.com.br').getOrElse(''),
    ).toBe('financeiro@eximiatech.com.br');
    expect(PixKeyValidator.validate('PHONE', '(61) 99630-1711').isRight()).toBe(true);
  });

  it('deve detectar cobranças duplicadas e responder perguntas no PierreFinancialEngine', () => {
    const account = new BankAccount({
      id: 'acc-1',
      institution: InstitutionCode.ITAU,
      nickname: 'Itaú Personnalité',
      balance: 18400,
      coordinates: ['341', '0500', '11223-9'],
      consentStatus: 'AUTHORIZED',
      lastSyncIso: '2026-11-09T10:00:00Z',
      colorAccentHex: '#EC7000',
    });

    const dup1 = new Transaction({
      id: 'dup-1',
      title: 'Spotify Premium',
      merchantName: 'Spotify',
      amount: 34.9,
      type: 'EXPENSE',
      category: TransactionCategory.SUBSCRIPTIONS,
      institution: InstitutionCode.ITAU,
      dateIso: '2026-11-08',
      isRecurring: true,
    });
    const dup2 = new Transaction({
      id: 'dup-2',
      title: 'Spotify Premium',
      merchantName: 'Spotify',
      amount: 34.9,
      type: 'EXPENSE',
      category: TransactionCategory.SUBSCRIPTIONS,
      institution: InstitutionCode.NUBANK,
      dateIso: '2026-11-08',
      isRecurring: true,
    });

    const summary = PierreFinancialEngine.buildDashboardSummary(
      [account],
      [dup1, dup2],
    );

    expect(summary.insights.some((i) => i.severity === 'CRITICAL')).toBe(true);
    const answer = PierreFinancialEngine.answerNaturalLanguageQuery(
      'Tem alguma cobrança duplicada?',
      summary,
      [dup1, dup2],
    );
    expect(answer).toContain('Spotify');
  });
});
