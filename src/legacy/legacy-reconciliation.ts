/**
 * Módulo de Evidência de Evolução e Refatoração (Seção 5 e Seção 6 do Projeto da Disciplina — Rubrica 4.4).
 *
 * Contém:
 * 1. O registro do código JavaScript legado de conciliação financeira e cálculo de taxas PIX,
 *    evidenciando 3 problemas clássicos de ausência de tipagem estática:
 *    - Coerção silenciosa de string em soma monetária (`1000 + "250.50" -> "1000250.50"`)
 *    - Propagação de `NaN` quando propriedade opcional (`feeRate`) vem ausente ou nula
 *    - Falta de verificação de exaustividade em `switch` de modalidade de liquidação
 * 2. A implementação refatorada em TypeScript estrito (`RefactoredReconciliationService`)
 *    utilizando Type Guards sobre `unknown`, Tuplas `SettlementBreakdownTuple`, `Either<Failure, T>`
 *    e `assertNever`.
 * 3. O catálogo estruturado de decisões técnicas sobre sugestões de IA (`AI_CRITICAL_REVIEWS`).
 */

import {
  type Either,
  type Failure,
  ValidationFailure,
  assertNever,
  hasStringField,
  isPlainRecord,
  left,
  right,
} from '@/core';

export type SettlementTier = 'STANDARD_PIX' | 'PRIORITY_ASAAS' | 'OPEN_FINANCE_DIRECT';

/**
 * Tupla representando o demonstrativo de liquidação: [valorBruto, taxaRetida, valorLiquido].
 */
export type SettlementBreakdownTuple = readonly [
  grossAmount: number,
  feeAmount: number,
  netAmount: number,
];

export interface ReconciliationItemInput {
  readonly id: string;
  readonly amount: number;
  readonly tier: SettlementTier;
  readonly feeOverridePercent?: number;
}

export interface ReconciliationSummary {
  readonly processedCount: number;
  readonly breakdown: SettlementBreakdownTuple;
  readonly items: readonly {
    readonly id: string;
    readonly tuple: SettlementBreakdownTuple;
  }[];
}

export const LEGACY_JS_CODE_SNAPSHOT = `// [ANTES — JavaScript Legado sem tipagem estática]
// Problemas detectados durante a migração para TypeScript:
// 1. Parâmetro 'items' sem contrato (aceitava objetos malformados ou strings numéricas).
// 2. Soma 'total += item.amount' concatenava strings ("1000250.50") quando a API retornava string.
// 3. 'item.amount * item.feeOverridePercent' gerava NaN quando feeOverridePercent era undefined.
// 4. Switch de 'tier' sem default exaustivo retornava taxa undefined para novas modalidades.

function reconcilePaymentsLegacy(items) {
  let totalGross = 0;
  let totalFees = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    totalGross += item.amount; // BUG 1: concatenação de string se amount for "250.50"

    let rate;
    if (item.feeOverridePercent !== null) {
      rate = item.feeOverridePercent; // BUG 2: se for undefined, passa no !== null e gera NaN!
    } else if (item.tier === 'STANDARD_PIX') {
      rate = 0;
    } else if (item.tier === 'PRIORITY_ASAAS') {
      rate = 0.0099;
    }
    // BUG 3: 'OPEN_FINANCE_DIRECT' não tratado -> rate fica undefined -> totalFees vira NaN
    totalFees += item.amount * rate;
  }

  return {
    gross: totalGross,
    fees: totalFees,
    net: totalGross - totalFees,
  };
}`;

export const REFACTORED_TS_CODE_SNAPSHOT = `// [DEPOIS — TypeScript Estrito com Clean Architecture, unknown Type Guards e assertNever]
export class RefactoredReconciliationService {
  public static resolveTierFeeRate(tier: SettlementTier): number {
    switch (tier) {
      case 'STANDARD_PIX':
        return 0;
      case 'PRIORITY_ASAAS':
        return 0.0099;
      case 'OPEN_FINANCE_DIRECT':
        return 0.0045;
      default:
        return assertNever(tier, 'Modalidade de liquidação desconhecida');
    }
  }
  // ... validação com Type Guards sobre unknown e retorno Either<Failure, ReconciliationSummary>
}`;

export class RefactoredReconciliationService {
  private constructor() {}

  public static resolveTierFeeRate(tier: SettlementTier): number {
    switch (tier) {
      case 'STANDARD_PIX':
        return 0;
      case 'PRIORITY_ASAAS':
        return 0.0099;
      case 'OPEN_FINANCE_DIRECT':
        return 0.0045;
      default:
        return assertNever(tier, 'Modalidade de liquidação não suportada');
    }
  }

  private static _isSettlementTier(value: unknown): value is SettlementTier {
    return (
      value === 'STANDARD_PIX' ||
      value === 'PRIORITY_ASAAS' ||
      value === 'OPEN_FINANCE_DIRECT'
    );
  }

  /**
   * Validador estrito de números para campos vindos de JSON/API externa (alinhado ao exercício
   * `numeroValido(valor: unknown, campo: string)` da Etapa 1, sem uso de `any` nem `as`).
   */
  public static numeroValido(
    valor: unknown,
    campo: string,
  ): Either<Failure, number> {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return right(valor);
    }
    if (typeof valor === 'string' && valor.trim() !== '') {
      const convertido = Number(valor);
      if (Number.isFinite(convertido)) {
        return right(convertido);
      }
    }
    return left(
      new ValidationFailure(
        `Campo numérico "${campo}" inválido na leitura da API: ${String(valor)}`,
        campo,
      ),
    );
  }

  /**
   * Converte e valida um item bruto (`unknown`) vindo de fonte externa antes do cálculo.
   */
  public static parseUnknownInput(
    raw: unknown,
  ): Either<Failure, ReconciliationItemInput> {
    if (!isPlainRecord(raw)) {
      return left(
        new ValidationFailure('Item de conciliação deve ser um objeto válido.'),
      );
    }

    if (!hasStringField(raw, 'id')) {
      return left(
        new ValidationFailure('Campo "id" obrigatório na conciliação.', 'id'),
      );
    }

    // Corrige o Bug 1 do JS legado usando numeroValido(unknown) sem `any` nem `as`
    const amountCheck = RefactoredReconciliationService.numeroValido(
      raw.amount,
      'amount',
    );
    if (amountCheck.isLeft()) {
      return left(amountCheck.value);
    }
    const parsedAmount = amountCheck.value;

    if (parsedAmount <= 0) {
      return left(
        new ValidationFailure(
          'O valor de conciliação deve ser positivo.',
          'amount',
        ),
      );
    }

    const tier: SettlementTier = RefactoredReconciliationService._isSettlementTier(
      raw.tier,
    )
      ? raw.tier
      : 'STANDARD_PIX';

    const feeOverridePercent =
      typeof raw.feeOverridePercent === 'number' &&
      Number.isFinite(raw.feeOverridePercent) &&
      raw.feeOverridePercent >= 0
        ? raw.feeOverridePercent
        : undefined;

    return right({
      id: raw.id,
      amount: parsedAmount,
      tier,
      feeOverridePercent,
    });
  }

  public static reconcileBatch(
    rawItems: readonly unknown[],
  ): Either<Failure, ReconciliationSummary> {
    if (rawItems.length === 0) {
      return left(
        new ValidationFailure(
          'Informe ao menos um lançamento para conciliação.',
        ),
      );
    }

    let totalGross = 0;
    let totalFees = 0;
    const processedItems: {
      readonly id: string;
      readonly tuple: SettlementBreakdownTuple;
    }[] = [];

    for (const rawItem of rawItems) {
      const parsedEither =
        RefactoredReconciliationService.parseUnknownInput(rawItem);
      if (parsedEither.isLeft()) {
        return left(parsedEither.value);
      }

      const item = parsedEither.value;
      const rate =
        typeof item.feeOverridePercent === 'number'
          ? item.feeOverridePercent
          : RefactoredReconciliationService.resolveTierFeeRate(item.tier);

      const gross = Number(item.amount.toFixed(2));
      const fee = Number((gross * rate).toFixed(2));
      const net = Number((gross - fee).toFixed(2));

      totalGross = Number((totalGross + gross).toFixed(2));
      totalFees = Number((totalFees + fee).toFixed(2));

      processedItems.push({
        id: item.id,
        tuple: [gross, fee, net],
      });
    }

    const totalNet = Number((totalGross - totalFees).toFixed(2));

    return right({
      processedCount: processedItems.length,
      breakdown: [totalGross, totalFees, totalNet],
      items: processedItems,
    });
  }
}

export interface AiCriticalReviewRecord {
  readonly id: string;
  readonly topic: string;
  readonly aiInitialSuggestion: string;
  readonly identifiedProblem: string;
  readonly adoptedEngineeringDecision: string;
  readonly relatedFile: string;
}

export const AI_CRITICAL_REVIEWS: readonly AiCriticalReviewRecord[] = [
  {
    id: 'ai-review-1',
    topic: 'Desserialização de payloads do localStorage e Webhook Asaas',
    aiInitialSuggestion:
      'Usar `const data = JSON.parse(raw) as any` ou `as TransactionModel[]` direto na leitura do armazenamento para economizar código.',
    identifiedProblem:
      'O cast direto (`as TransactionModel[]`) oculta dados corrompidos em tempo de execução e perde os métodos da prototipagem da classe `TransactionModel`, além de violar a proibição de `any`.',
    adoptedEngineeringDecision:
      'Implementamos `safeJsonParse(raw): Either<Failure, unknown>` combinado com `TransactionModel.fromUnknown(item)` usando Type Guards (`isPlainRecord`, `hasStringField`, `hasNumberField`).',
    relatedFile: 'src/data/models/transaction.model.ts',
  },
  {
    id: 'ai-review-2',
    topic: 'Configuração do tsconfig.json no TypeScript 5.9',
    aiInitialSuggestion:
      'Reutilizar integralmente o `tsconfig.json` do template base contendo `"erasableSyntaxOnly": true` e sem emissão de Source Maps.',
    identifiedProblem:
      'A flag `erasableSyntaxOnly` bloqueia o uso de `enum` e propriedades de construtor (`private readonly`), recursos exigidos pelos itens 2.3 e 4.3 da rubrica, além de não gerar arquivos `.js.map`.',
    adoptedEngineeringDecision:
      'Ajustamos o `tsconfig.json` com `"sourceMap": true`, `"noImplicitOverride": true` e criamos `tsconfig.build.core.json` para emitir `.js`, `.d.ts` e `.js.map` verificáveis em `dist-core/`.',
    relatedFile: 'tsconfig.build.core.json',
  },
  {
    id: 'ai-review-3',
    topic: 'Modelagem de Entidades e Controle de Mutabilidade',
    aiInitialSuggestion:
      'Definir `BankAccount` e `Transaction` apenas como interfaces planas com propriedades públicas mutáveis (`balance: number`).',
    identifiedProblem:
      'Interfaces planas mutáveis permitem que a camada de UI altere `account.balance -= 500` diretamente, ignorando a verificação de consentimento do Open Finance (`isAuthorized`) e regras de saldo negativo.',
    adoptedEngineeringDecision:
      'Modelamos `BankAccount` e `Transaction` como classes OOP com campos encapsulados (`private _balance`, `private _consentStatus`, `protected readonly _rawAmount`) e métodos que retornam `Either<Failure, number>`.',
    relatedFile: 'src/domain/entities/bank-account.entity.ts',
  },
  {
    id: 'ai-review-4',
    topic: 'Controle de Complexidade em Tipos Condicionais e Genéricos',
    aiInitialSuggestion:
      'Criar um tipo condicional recursivo de 4 níveis para inferir rotas, payloads e headers HTTP simultaneamente.',
    identifiedProblem:
      'Tipos condicionais excessivamente aninhados prejudicam a legibilidade das mensagens de erro do compilador sem trazer ganho real ao domínio financeiro.',
    adoptedEngineeringDecision:
      'Mantivemos apenas tipos utilitários com propósito claro no domínio: `FlavorGatewayContract<F>`, `UnwrapEitherSuccess<T>`, `DeepReadonly<T>` e `EntityPatch<T>`.',
    relatedFile: 'src/core/types/advanced-types.ts',
  },
] as const;
