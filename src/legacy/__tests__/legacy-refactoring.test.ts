import { describe, expect, it } from 'vitest';
import {
  AI_CRITICAL_REVIEWS,
  RefactoredReconciliationService,
} from '../index';

describe('Legacy Refactoring (Seção 5 & 6) — De JavaScript Fraco para TypeScript Estrito', () => {
  it('deve corrigir coerção de string numérica, evitar NaN em taxas opcionais e retornar tupla [bruto, taxa, liquido]', () => {
    const rawExternalBatch: readonly unknown[] = [
      // No JS legado, "250.50" causava concatenação de string ("1000250.50")
      { id: 'rec-1', amount: '250.50', tier: 'STANDARD_PIX' },
      // No JS legado, feeOverridePercent ausente causava NaN
      { id: 'rec-2', amount: 1000, tier: 'PRIORITY_ASAAS' },
      // No JS legado, OPEN_FINANCE_DIRECT não tinha case no switch
      { id: 'rec-3', amount: 2000, tier: 'OPEN_FINANCE_DIRECT' },
    ];

    const result = RefactoredReconciliationService.reconcileBatch(rawExternalBatch);
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const [gross, fee, net] = result.value.breakdown;
      expect(gross).toBe(3250.5);
      // 0 + (1000 * 0.0099 = 9.90) + (2000 * 0.0045 = 9.00) = 18.90
      expect(fee).toBe(18.9);
      expect(net).toBe(3231.6);
    }
  });

  it('deve rejeitar entradas corrompidas com Left(ValidationFailure) e manter registro de revisão crítica de IA', () => {
    const corruptedBatch: readonly unknown[] = [
      { id: 'bad-1', amount: 'abc-nao-numerico', tier: 'STANDARD_PIX' },
    ];

    const outcome = RefactoredReconciliationService.reconcileBatch(corruptedBatch);
    expect(outcome.isLeft()).toBe(true);
    expect(AI_CRITICAL_REVIEWS.length).toBeGreaterThanOrEqual(4);
  });
});
