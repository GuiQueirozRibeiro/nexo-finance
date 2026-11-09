# 03 — Mapa da Rubrica (TypeScript para Desenvolvimento Front-end [26E4_2])

Este guia mapeia cada uma das **4 competências e 16 itens da rubrica oficial da Infnet** diretamente para os arquivos do projeto **Nexo Finance**.

## Competência 1: Tipagem Estática, Inferência, Primitivos, Uniões e Literais

| Item da Rubrica | Onde é demonstrado | Como foi implementado |
|---|---|---|
| **1.1** Tipos primitivos, uniões (`\|`) e tipos literais conforme regras de negócio | `src/core/errors/failures.ts`, `src/domain/entities/` ⏳ | `FailureCode`, `FailureSeverity` (`'LOW' \| 'MEDIUM' \| 'HIGH'`), `TransactionType` (`'INCOME' \| 'EXPENSE' \| 'PIX_TRANSFER'`), `PixKeyType` (`'CPF' \| 'EMAIL' \| 'PHONE' \| 'RANDOM'`). |
| **1.2** Uso apropriado de inferência de tipos vs. declarações explícitas | `src/core/enums/enums.ts`, `src/domain/usecases/` ⏳ | Inferência em constantes imutáveis (`as const`) e variáveis locais; tipagem explícita obrigatória em assinaturas públicas de métodos, retornos de `UseCase` e contratos de interface. |
| **1.3** Objetos tipados e funções com parâmetros e retornos coerentes | `src/core/types/advanced-types.ts`, `src/domain/` ⏳ | Funções puras de cálculo financeiro, formatação e validação retornando `Either<Failure, T>`. |
| **1.4** Combinação de uniões, literais, inferência e funções tipadas | `src/core/config/flavor-config.ts`, `src/domain/` ⏳ | Discriminated Unions (`Left` vs `Right` via `readonly tag`, status de consentimento Open Finance e status de cobrança PIX). |

## Competência 2: Interfaces, Classes OOP, Tuplas e Spread/Rest

| Item da Rubrica | Onde é demonstrado | Como foi implementado |
|---|---|---|
| **2.1** Interfaces coerentes com os dados e contratos do domínio | `src/core/usecase/usecase.ts`, `src/domain/repositories/` ⏳ | `IUseCase<SuccessType, Params>`, `IConnectionChecker`, `EnvironmentProfile`, interfaces de repositórios e DTOs. |
| **2.2** Arrays tipados, Tuplas e operadores Spread/Rest (`...`) | `src/domain/entities/` ⏳, `src/data/` ⏳ | Tuplas nomeadas como `BudgetThresholdTuple = readonly [minLimit: number, maxLimit: number]` e `BankCoordinatesTuple = readonly [bankCode: string, branch: string, accountDigit: string]`; operadores `...spread` em `copyWith` e `...rest` em agregadores de transações. |
| **2.3** Classes com encapsulamento, modificadores de visibilidade e membros estáticos | `src/core/errors/failures.ts`, `src/core/config/flavor-config.ts`, `src/domain/entities/` ⏳ | Uso real de `private`, `protected`, `public`, `readonly`, `override`, construtores privados (`NoParams`, `FlavorConfig`) e contadores/fábricas `static`. |
| **2.4** Articulação entre interfaces, uniões/interseções (`\|`, `&`), tipagem de funções e classes | `src/core/either/either.ts`, `src/core/types/advanced-types.ts` | `FoldCallback<Input, Output>`, interseções em `EntityPatch<T>` e Type Guards (`Record<K, string> & Record<string, unknown>`). |

## Competência 3: Generics, `unknown` vs `any`, `keyof`/`typeof`, Mapped/Conditional Types e Exaustividade

| Item da Rubrica | Onde é demonstrado | Como foi implementado |
|---|---|---|
| **3.1** Controle de `any` (proibido via ESLint) e tratamento seguro de `unknown` | `src/core/types/advanced-types.ts`, `src/data/models/` ⏳ | Regra `@typescript-eslint/no-explicit-any: error`; `safeJsonParse` retorna `Either<Failure, unknown>` refinado por `isPlainRecord`, `hasStringField` e `hasNumberField`. |
| **3.2** Uso correto de `keyof`, `typeof` e asserções de tipo seguras | `src/core/types/advanced-types.ts`, `src/core/enums/enums.ts` | `getPropertyByKey<T, K extends keyof T>`, `pickObjectKeys`, `typeof CATEGORY_METADATA` e `as const`. |
| **3.3** Generics reutilizáveis reduzindo duplicação e preservando tipos | `src/core/either/either.ts`, `src/core/usecase/usecase.ts` | `Either<L, R>`, `IUseCase<SuccessType, Params>`, `FlavorConfig.getProfileFor<F extends AppFlavor>(flavor: F)`. |
| **3.4** Mapped Types, Conditional Types e validação de exaustividade (`never`) | `src/core/types/advanced-types.ts`, `src/core/config/flavor-config.ts` | Mapped Types (`DeepReadonly<T>`, `EntityPatch<T>`, `FieldValidationMap<T>`), Conditional Types (`FlavorGatewayContract<F>`, `UnwrapEitherSuccess<T>`) e `assertNever(value: never): never`. |

## Competência 4: `tsconfig.json`, Compilação, Source Maps, Enums, Refatoração e Avaliação de IA

| Item da Rubrica | Onde é demonstrado | Como foi implementado |
|---|---|---|
| **4.1** Configuração do `tsconfig.json` e demonstração do compilador | `tsconfig.json`, `tsconfig.build.core.json` | Flags estritas (`strict`, `noImplicitAny`, `strictNullChecks`, `noImplicitOverride`, `noFallthroughCasesInSwitch`) e script `npm run build:core` (`tsc`). |
| **4.2** Dependências de tipos (`@types/*`) e uso de Source Maps | `package.json`, `tsconfig.json`, `tsconfig.build.core.json`, `next.config.ts` | `@types/node`, `@types/react`, `@types/react-dom`; `"sourceMap": true` e `"declarationMap": true` gerando arquivos `.js.map` e `.d.ts.map` em `dist-core/`. |
| **4.3** Recursos modernos de ECMAScript (`ES2022`) e `enum` pertinentes | `src/core/enums/enums.ts` | `AppFlavor`, `TransactionCategory` e `InstitutionCode` com validação exaustiva. |
| **4.4** Evidências de refatoração (JS → TS) e análise crítica de sugestões de IA | `src/legacy/` ⏳, `docs/` ⏳ | Comparativo antes/depois de código JS com falhas de coerção refatorado para TS estrito e registro objetivo de decisões sobre sugestões de IA. |
