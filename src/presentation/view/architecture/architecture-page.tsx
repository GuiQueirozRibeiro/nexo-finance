'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  FileCode,
  GitCompare,
  Layers,
  Play,
  ShieldCheck,
} from 'lucide-react';
import {
  AI_CRITICAL_REVIEWS,
  LEGACY_JS_CODE_SNAPSHOT,
  REFACTORED_TS_CODE_SNAPSHOT,
  RefactoredReconciliationService,
} from '@/legacy';
import { NexoNavbar } from '../components/nexo-navbar';

interface RubricItemRecord {
  readonly id: string;
  readonly competencyGroup: 'C1' | 'C2' | 'C3' | 'C4';
  readonly rubricTitle: string;
  readonly filePath: string;
  readonly explanation: string;
  readonly codeSnippet: string;
}

const RUBRIC_ITEMS: readonly RubricItemRecord[] = [
  {
    id: '1.1',
    competencyGroup: 'C1',
    rubricTitle: '1.1 Tipos primitivos, uniões (|) e tipos literais no domínio',
    filePath: 'src/domain/entities/financial-primitives.ts',
    explanation:
      'Modela estados e operações financeiras com uniões de literais estritas, impedindo valores mágicos inválidos em tempo de compilação.',
    codeSnippet: `export type TransactionType = 'INCOME' | 'EXPENSE' | 'PIX_TRANSFER';
export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';
export type OpenFinanceConsentStatus = 'AUTHORIZED' | 'EXPIRED' | 'REVOKED';`,
  },
  {
    id: '1.2',
    competencyGroup: 'C1',
    rubricTitle: '1.2 Uso equilibrado entre inferência de tipos e tipagem explícita',
    filePath: 'src/domain/entities/transaction.entity.ts',
    explanation:
      'Aplica tipagem explícita em contratos públicos (parâmetros e retornos de métodos/UseCases) e aproveita a inferência do compilador em acumuladores locais e constantes `as const`.',
    codeSnippet: `public static calculateNetBalance(...items: readonly Transaction[]): number {
  const total = items.reduce((acc, tx) => acc + tx.signedAmount, 0); // inferido como number
  return Number(total.toFixed(2));
}`,
  },
  {
    id: '1.3',
    competencyGroup: 'C1',
    rubricTitle: '1.3 Objetos tipados e funções seguras nas regras de negócio',
    filePath: 'src/domain/entities/transaction.entity.ts',
    explanation:
      'Valida propriedades de entrada com `Transaction.validateProps` retornando `Either<Failure, Transaction>` em vez de lançar exceções não rastreadas.',
    codeSnippet: `public static validateProps(props: TransactionProps): Either<Failure, Transaction> {
  if (!Number.isFinite(props.amount) || props.amount <= 0) {
    return left(new ValidationFailure('O valor deve ser positivo.', 'amount'));
  }
  return right(new Transaction(props));
}`,
  },
  {
    id: '1.4',
    competencyGroup: 'C1',
    rubricTitle: '1.4 Combinação de uniões, literais e funções para cenários do domínio',
    filePath: 'src/domain/entities/financial-insight.entity.ts',
    explanation:
      'Combina status de orçamento (`WITHIN_IDEAL | NEAR_LIMIT | EXCEEDED`), severidades (`INFO | WARNING | CRITICAL`) e funções puras no motor PierreFinancialEngine.',
    codeSnippet: `const status: CategoryBreakdownItem['status'] =
  spent > maxCeiling ? 'EXCEEDED' : spent > idealLimit ? 'NEAR_LIMIT' : 'WITHIN_IDEAL';`,
  },
  {
    id: '2.1',
    competencyGroup: 'C2',
    rubricTitle: '2.1 Interfaces coerentes com os contratos do domínio (ISP / DIP)',
    filePath: 'src/domain/repositories/repositories.ts',
    explanation:
      'Segrega os contratos da camada Domain em interfaces específicas (`ITransactionRepository`, `IOpenFinanceRepository`, `IPixGatewayRepository` e `IUseCase<Success, Params>`).',
    codeSnippet: `export interface IOpenFinanceRepository {
  getConnectedAccounts(): Promise<Either<Failure, readonly BankAccount[]>>;
  syncInstitution(institution: InstitutionCode): Promise<Either<Failure, OpenFinanceSyncReport>>;
  toggleConsent(accountId: string, authorize: boolean): Promise<Either<Failure, BankAccount>>;
}`,
  },
  {
    id: '2.2',
    competencyGroup: 'C2',
    rubricTitle: '2.2 Arrays readonly, Tuplas e operadores Spread/Rest (...)',
    filePath: 'src/domain/entities/financial-primitives.ts',
    explanation:
      'Utiliza tuplas imutáveis para coordenadas bancárias (`[banco, agencia, conta]`), tetos de orçamento (`[metaIdeal, tetoAlerta]`) e QR Code PIX, além de `...spread` em `copyWith` e `...rest` em cálculos.',
    codeSnippet: `export type BankCoordinatesTuple = readonly [
  bankCode: string,
  branchNumber: string,
  accountWithDigit: string,
];
export type BudgetThresholdTuple = readonly [idealLimit: number, maxAlertCeiling: number];`,
  },
  {
    id: '2.3',
    competencyGroup: 'C2',
    rubricTitle: '2.3 Classes OOP com encapsulamento, visibilidade e membros estáticos',
    filePath: 'src/domain/entities/bank-account.entity.ts',
    explanation:
      'Protege o saldo (`private _balance`) e o consentimento (`private _consentStatus`) dentro de `BankAccount`, além de contadores e validadores `static` em `Failure` e `PixKeyValidator`.',
    codeSnippet: `export class BankAccount {
  private _balance: number;
  private _consentStatus: OpenFinanceConsentStatus;
  public get balance(): number { return this._balance; }
  public credit(amount: number): Either<Failure, number> { ... }
}`,
  },
  {
    id: '2.4',
    competencyGroup: 'C2',
    rubricTitle: '2.4 Articulação de interfaces, uniões/interseções (&), funções e classes',
    filePath: 'src/core/either/either.ts',
    explanation:
      'Articula interseções de metadados (`IdentifiableContract & AuditableContract`), callbacks tipados (`FoldCallback<Input, Output>`) e herança entre `TransactionModel` e `Transaction`.',
    codeSnippet: `export type DomainRecordMetadata = IdentifiableContract & AuditableContract;
export type FoldCallback<Input, Output> = (value: Input) => Output;`,
  },
  {
    id: '3.1',
    competencyGroup: 'C3',
    rubricTitle: '3.1 Proibição de any e tratamento seguro de unknown com Type Guards',
    filePath: 'src/data/models/transaction.model.ts',
    explanation:
      'A regra `@typescript-eslint/no-explicit-any: error` proíbe `any`. Todo dado externo entra como `unknown` e passa por `isPlainRecord`, `hasStringField` e `hasNumberField`.',
    codeSnippet: `public static fromUnknown(raw: unknown): Either<Failure, TransactionModel> {
  if (!isPlainRecord(raw) || !hasStringField(raw, 'id') || !hasNumberField(raw, 'amount')) {
    return left(new ValidationFailure('Payload de transação inválido.'));
  }
  return right(new TransactionModel({ ... }));
}`,
  },
  {
    id: '3.2',
    competencyGroup: 'C3',
    rubricTitle: '3.2 Operadores keyof, typeof e asserções de tipo seguras',
    filePath: 'src/core/types/advanced-types.ts',
    explanation:
      'Usa `keyof` para acesso seguro a propriedades (`getPropertyByKey`, `pickObjectKeys`) e `typeof CATEGORY_METADATA` para derivar tipos a partir de constantes imutáveis.',
    codeSnippet: `export type CategoryMetadataMap = typeof CATEGORY_METADATA;
export function getPropertyByKey<T extends object, K extends keyof T>(target: T, key: K): T[K] {
  return target[key];
}`,
  },
  {
    id: '3.3',
    competencyGroup: 'C3',
    rubricTitle: '3.3 Generics reutilizáveis preservando tipos nas operações',
    filePath: 'src/core/usecase/usecase.ts',
    explanation:
      'Implementa `Either<L, R>`, `IUseCase<SuccessType, Params>` e `FlavorConfig.getProfileFor<F extends AppFlavor>(flavor: F)` eliminando duplicação de contratos.',
    codeSnippet: `export interface IUseCase<SuccessType, Params> {
  execute(params: Params): Promise<Either<Failure, SuccessType>>;
}`,
  },
  {
    id: '3.4',
    competencyGroup: 'C3',
    rubricTitle: '3.4 Mapped Types, Conditional Types e validação de exaustividade (never)',
    filePath: 'src/core/config/flavor-config.ts',
    explanation:
      'Emprega `DeepReadonly<T>`, `EntityPatch<T>`, `FlavorGatewayContract<F>` (Conditional Type) e `assertNever(value: never): never` nos switches de Enums e chaves PIX.',
    codeSnippet: `export type FlavorGatewayContract<F extends AppFlavor> =
  F extends AppFlavor.PROD ? ProdGatewayContract : DevGatewayContract;

export function assertNever(value: never, context = 'Valor não tratado'): never {
  throw new Error(\`\${context}: \${String(value)}\`);
}`,
  },
  {
    id: '4.1',
    competencyGroup: 'C4',
    rubricTitle: '4.1 Configuração estrita do tsconfig.json e compilação do módulo',
    filePath: 'tsconfig.json',
    explanation:
      'Habilita `strict`, `noImplicitAny`, `strictNullChecks`, `noImplicitOverride`, `noUnusedLocals`, `noFallthroughCasesInSwitch` e `tsc -p tsconfig.build.core.json`.',
    codeSnippet: `"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,
"noImplicitOverride": true,
"sourceMap": true`,
  },
  {
    id: '4.2',
    competencyGroup: 'C4',
    rubricTitle: '4.2 Gestão de pacotes @types/* e emissão de Source Maps (.js.map)',
    filePath: 'tsconfig.build.core.json',
    explanation:
      'Gerencia `@types/node`, `@types/react` e `@types/react-dom` e gera arquivos `.js.map` e `.d.ts.map` em `dist-core/` via `npm run build:core`.',
    codeSnippet: `"outDir": "./dist-core",
"sourceMap": true,
"declaration": true,
"declarationMap": true`,
  },
  {
    id: '4.3',
    competencyGroup: 'C4',
    rubricTitle: '4.3 Recursos modernos de ECMAScript (ES2022) e Enums pertinentes',
    filePath: 'src/core/enums/enums.ts',
    explanation:
      'Define os enums `AppFlavor`, `TransactionCategory` e `InstitutionCode` integrados a helpers exaustivos e recursos modernos do ES2022.',
    codeSnippet: `export enum AppFlavor { DEV = 'DEV', PROD = 'PROD' }
export enum InstitutionCode { NUBANK = 'NUBANK', ITAU = 'ITAU', INTER = 'INTER', ASAAS = 'ASAAS' }`,
  },
  {
    id: '4.4',
    competencyGroup: 'C4',
    rubricTitle: '4.4 Refatoração de JS legado para TS e análise objetiva de IA',
    filePath: 'src/legacy/legacy-reconciliation.ts',
    explanation:
      'Documenta e testa a migração do cálculo de conciliação financeira de JS para TS estrito e registra 4 revisões técnicas sobre sugestões de IA.',
    codeSnippet: `const result = RefactoredReconciliationService.reconcileBatch(rawExternalBatch);
// Retorna Either<Failure, ReconciliationSummary> com tupla [gross, fee, net]`,
  },
] as const;

export function ArchitecturePage() {
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'C1' | 'C2' | 'C3' | 'C4'>('ALL');
  const [simInputAmount, setSimInputAmount] = useState('250.50');
  const [simResultText, setSimResultText] = useState<string | null>(null);

  const visibleItems =
    selectedGroup === 'ALL'
      ? RUBRIC_ITEMS
      : RUBRIC_ITEMS.filter((item) => item.competencyGroup === selectedGroup);

  const runLiveRefactoringDemo = () => {
    const rawBatch: readonly unknown[] = [
      { id: 'lote-1', amount: simInputAmount, tier: 'STANDARD_PIX' },
      { id: 'lote-2', amount: 1000, tier: 'PRIORITY_ASAAS' },
      { id: 'lote-3', amount: 2000, tier: 'OPEN_FINANCE_DIRECT' },
    ];

    const outcome = RefactoredReconciliationService.reconcileBatch(rawBatch);
    outcome.fold(
      (failure) => {
        setSimResultText(`Bloqueado com segurança (Left): ${failure.toSummary()}`);
      },
      (summary) => {
        const [gross, fee, net] = summary.breakdown;
        setSimResultText(
          `Sucesso (Right) • Tupla [Bruto: R$ ${gross.toFixed(2)}, Taxa: R$ ${fee.toFixed(2)}, Líquido: R$ ${net.toFixed(2)}] (No JS legado, 1000 + "${simInputAmount}" gerava concatenação incorreta!)`,
        );
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#050a0b] text-white">
      <NexoNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* HEADER */}
        <section className="rounded-2xl border border-[#185054]/70 bg-gradient-to-r from-[#0b191b] to-[#060d0e] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#0df0b2] mb-2">
            <Cpu className="h-4 w-4" />
            <span>PROJETO DE DISCIPLINA • TYPESCRIPT PARA DESENVOLVIMENTO FRONT-END [26E4_2]</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl text-white mb-3">
            Arquitetura Limpa, SOLID e Mapa da Rubrica
          </h1>
          <p className="text-sm sm:text-base text-[#b6c8c6] max-w-3xl leading-relaxed">
            Esta página documenta a engenharia do <strong>Nexo Finance</strong>, conectando
            a arquitetura em 3 camadas do projeto de referência <code>pos/App_Nasa</code> aos{' '}
            <strong>16 itens avaliados na rubrica oficial</strong>.
          </p>
        </section>

        {/* RUBRIC INSPECTOR */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#0df0b2]" />
                16 Itens da Rubrica Mapeados no Código
              </h2>
              <p className="text-xs text-[#8baba6]">
                Filtre por competência para inspecionar os arquivos e contratos TypeScript.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Todos (16)' },
                { id: 'C1', label: '1. Fundamentos & Inferência' },
                { id: 'C2', label: '2. Interfaces, Tuplas & OOP' },
                { id: 'C3', label: '3. Generics, unknown & Mapped' },
                { id: 'C4', label: '4. tsconfig, SourceMaps & IA' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setSelectedGroup(tab.id as 'ALL' | 'C1' | 'C2' | 'C3' | 'C4')
                  }
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedGroup === tab.id
                      ? 'bg-[#0df0b2] text-black'
                      : 'border border-[#185054] bg-[#0a1416] text-[#b6c8c6] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0df0b2]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.rubricTitle}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded bg-black/70 border border-[#185054]/50 px-2 py-0.5 text-[11px] font-mono text-[#8baba6] mb-2">
                    <FileCode className="h-3 w-3 text-[#0df0b2]" />
                    {item.filePath}
                  </div>
                  <p className="text-xs text-[#d9d9d9] leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                <pre className="rounded-xl bg-black/90 border border-[#185054]/50 p-3 text-[11px] font-mono text-[#b6c8c6] overflow-x-auto">
                  <code>{item.codeSnippet}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 5: EVOLUÇÃO E REFATORAÇÃO (JS -> TS) */}
        <section className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg text-white flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-[#0df0b2]" />
                Seção 5 • Evidência de Evolução e Refatoração (JS Legado → TS Estrito)
              </h2>
              <p className="text-xs text-[#8baba6]">
                Comparativo prático em <code>src/legacy/legacy-reconciliation.ts</code>{' '}
                corrigindo coerção de string, propagação de <code>NaN</code> e falta de
                exaustividade.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-[#ef5000] mb-1.5">
                ANTES — JavaScript sem Tipagem Estática
              </span>
              <pre className="rounded-xl bg-black border border-[#ef5000]/40 p-4 text-[11px] font-mono text-[#d9d9d9] overflow-x-auto max-h-72">
                <code>{LEGACY_JS_CODE_SNAPSHOT}</code>
              </pre>
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#0df0b2] mb-1.5">
                DEPOIS — TypeScript Estrito com unknown + assertNever + Either
              </span>
              <pre className="rounded-xl bg-black border border-[#0df0b2]/40 p-4 text-[11px] font-mono text-[#d9d9d9] overflow-x-auto max-h-72">
                <code>{REFACTORED_TS_CODE_SNAPSHOT}</code>
              </pre>
            </div>
          </div>

          {/* Testador Interativo da Refatoração */}
          <div className="rounded-xl border border-[#185054] bg-black/70 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] text-[#8baba6] mb-1">
                Teste um valor externo (ex.: &quot;250.50&quot; ou um texto inválido como
                &quot;erro-abc&quot;):
              </label>
              <input
                type="text"
                value={simInputAmount}
                onChange={(e) => setSimInputAmount(e.target.value)}
                className="w-full rounded-lg border border-[#185054] bg-[#0a1416] px-3 py-1.5 text-xs text-white focus:border-[#0df0b2] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={runLiveRefactoringDemo}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0df0b2] px-4 py-2.5 text-xs font-bold text-black hover:bg-white transition-all"
            >
              <Play className="h-3.5 w-3.5" />
              Executar Lote Refatorado
            </button>
          </div>

          {simResultText && (
            <div className="rounded-xl border border-[#0df0b2]/40 bg-[#0df0b2]/10 p-3 text-xs text-white font-mono">
              {simResultText}
            </div>
          )}
        </section>

        {/* SEÇÃO 6: AVALIAÇÃO DE SUGESTÕES DE IA */}
        <section className="rounded-2xl border border-[#185054]/70 bg-[#0a1416] p-6 space-y-4">
          <div>
            <h2 className="font-heading text-lg text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0df0b2]" />
              Seção 6 • Registro e Avaliação Técnica do Uso de IA
            </h2>
            <p className="text-xs text-[#8baba6]">
              Decisões técnicas onde sugestões padrão foram ajustadas para preservar a
              segurança de tipos, o encapsulamento OOP e a simplicidade da arquitetura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_CRITICAL_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-[#185054]/60 bg-black/60 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[#0df0b2]">
                    {review.topic}
                  </span>
                  <span className="text-[11px] font-mono text-[#859a9b]">
                    {review.relatedFile}
                  </span>
                </div>
                <p className="text-xs text-[#b6c8c6]">
                  <strong className="text-white">Sugestão Inicial:</strong>{' '}
                  {review.aiInitialSuggestion}
                </p>
                <p className="text-xs text-[#b6c8c6]">
                  <strong className="text-[#ef5000]">Problema Identificado:</strong>{' '}
                  {review.identifiedProblem}
                </p>
                <p className="text-xs text-[#d9d9d9]">
                  <strong className="text-[#0df0b2]">Decisão Adotada:</strong>{' '}
                  {review.adoptedEngineeringDecision}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
