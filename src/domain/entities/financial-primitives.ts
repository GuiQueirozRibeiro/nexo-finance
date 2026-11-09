/**
 * Tipos primitivos, literais, uniões, interseções e tuplas do domínio financeiro.
 *
 * Competências da Rubrica contempladas:
 * - 1.1 Modelagem com tipos primitivos, uniões (|) e tipos literais
 * - 1.4 Combinação de uniões, tipos literais e contratos de domínio
 * - 2.1 Interfaces coerentes com os contratos do módulo
 * - 2.2 Uso de Tuplas (readonly [..]) pertinentes às regras financeiras
 * - 2.4 Articulação de uniões e interseções (&)
 */

import type { InstitutionCode, TransactionCategory } from '@/core';

export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'PIX_TRANSFER';

export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';

export type PixOperationStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export type OpenFinanceConsentStatus = 'AUTHORIZED' | 'EXPIRED' | 'REVOKED';

export type InsightSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

/**
 * TUPLA 1: Coordenadas bancárias padronizadas no formato [codigoCompe, agencia, contaComDigito].
 * Exemplo: ['260', '0001', '94820-7']
 */
export type BankCoordinatesTuple = readonly [
  bankCode: string,
  branchNumber: string,
  accountWithDigit: string,
];

/**
 * TUPLA 2: Faixa de orçamento mensal para uma categoria [metaIdeal, tetoMaximoAlerta].
 * Exemplo: [800, 1200]
 */
export type BudgetThresholdTuple = readonly [
  idealLimit: number,
  maxAlertCeiling: number,
];

/**
 * TUPLA 3: Payload de QR Code PIX gerado pelo gateway [emvCopyPaste, expirationIsoDate].
 */
export type PixQrPayloadTuple = readonly [
  copyPasteCode: string,
  expiresAtIso: string,
];

/**
 * Contratos base combinados via Interseção (&) para rastreabilidade de entidades.
 */
export interface IdentifiableContract {
  readonly id: string;
}

export interface AuditableContract {
  readonly createdAtIso: string;
  readonly updatedAtIso?: string;
}

export type DomainRecordMetadata = IdentifiableContract & AuditableContract;

export interface CategoryBudgetRule {
  readonly category: TransactionCategory;
  readonly thresholds: BudgetThresholdTuple;
}

export interface OpenFinanceSyncReport {
  readonly institution: InstitutionCode;
  readonly syncedTransactionsCount: number;
  readonly updatedBalance: number;
  readonly syncedAtIso: string;
}
