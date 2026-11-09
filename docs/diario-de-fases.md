# Diário de Fases — Nexo Finance

Registro passo a passo do que foi construído em cada fase, os conceitos de TypeScript e Clean Architecture aplicados e como validar.

## Combinados do Projeto

- **Disciplina:** TypeScript para Desenvolvimento Front-end [26E4_2]
- **PDF da entrega:** `guilhermeribeiro_typescriptparadesenvolvimentofrontend_pd.pdf`
- **Prazo no Moodle:** 16/11/2026
- **Nome do projeto:** Nexo Finance (`pos/nexo-finance`) — Identidade visual Exímia Tech
- **Arquitetura de referência:** `pos/App_Nasa` (Clean Architecture em 3 camadas + Core, SOLID, MVVM e Flavors `DEV`/`PROD`)
- **Fluxo de trabalho:** evolução gradual da Fase 0 à Fase 6, validando compilação, lint e testes a cada etapa.

---

## Fase 0 — Setup, `tsconfig.json`, Flavors e Camada `core/` ✅ (09/11/2026)

### O que foi feito

1. **Repositório e Identidade Visual Exímia Tech:**
   - Inicializado repositório Git independente em `pos/nexo-finance`.
   - Importados os ativos oficiais da Exímia Tech (`EXIMIA-LOGO5-C.png`, `EXIMIA-FAVICON1..4.png`, `favicon.svg` e as fontes `Michroma` e `Archivo`) e configurados os tokens de cor em `src/index.css`.
2. **Configuração do Compilador TypeScript e Ambiente (Rubrica 4.1, 4.2, 4.3):**
   - `tsconfig.json`: configurado com `"target": "ES2022"`, `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, `"noImplicitOverride": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true` e `"sourceMap": true`.
   - `tsconfig.build.core.json`: configuração dedicada para transpilar as camadas puras (`core`, `domain`, `data`, `legacy`) via `npm run build:core` (`tsc`), emitindo arquivos `.js`, `.d.ts` e `.js.map` (Source Maps) na pasta `dist-core/`.
   - `eslint.config.js`: regra `@typescript-eslint/no-explicit-any: "error"` ativada para impedir qualquer uso acidental de `any`.
3. **Construção da Camada `src/core/` (Espelhando `App_Nasa/core`):**
   - `src/core/either/either.ts`: Mônada funcional `Either<L, R>` (`Left` e `Right`) com Generics, Type Guards (`this is Left<L, R>`), `fold`, `map` e `getOrElse`.
   - `src/core/errors/failures.ts` e `exceptions.ts`: classe abstrata `Failure` com encapsulamento (`private static _totalOccurrences`, `protected readonly metadata`, `public readonly code`), herança polimórfica (`ValidationFailure`, `OpenFinanceFailure`, `PixGatewayFailure`, `StorageFailure`, `NetworkFailure`) e modificador `override`.
   - `src/core/usecase/usecase.ts`: contrato genérico `IUseCase<SuccessType, Params>` e singleton `NoParams` com construtor `private`.
   - `src/core/enums/enums.ts`: enums `AppFlavor`, `TransactionCategory` e `InstitutionCode`, além do mapa constante `CATEGORY_METADATA` demonstrando `typeof`, `keyof` e switches exaustivos com `assertNever`.
   - `src/core/types/advanced-types.ts`: `assertNever(value: never): never`, Type Guards para `unknown` (`isPlainRecord`, `hasStringField`, `hasNumberField`, `safeJsonParse`), funções genéricas com `keyof` (`getPropertyByKey`, `pickObjectKeys`), *Mapped Types* (`DeepReadonly<T>`, `EntityPatch<T>`, `FieldValidationMap<T>`) e *Conditional Types* (`UnwrapEitherSuccess<T>`, `UnwrapEitherFailure<T>`).
   - `src/core/config/flavor-config.ts`: gerenciador `FlavorConfig` (`AppFlavor.DEV` vs `AppFlavor.PROD`) usando *Conditional Type* `FlavorGatewayContract<F>` e padrão Observer.
   - `src/core/network/connection-checker.ts`: contrato `IConnectionChecker` e implementação `BrowserConnectionChecker`.
4. **Testes Unitários da Camada Core (`src/core/__tests__/core.test.ts`):**
   - Suíte Vitest cobrindo `Either`, `Failure`, `Type Guards` sobre `unknown`, `keyof`/`typeof`, `Enums` e `FlavorConfig`.

### Como testar a Fase 0

```bash
npm run typecheck    # Verifica tipos com tsc --noEmit
npm run build:core   # Transpila src/core para dist-core/ gerando .js, .d.ts e .js.map (Source Maps)
npm run lint         # ESLint estrito (proíbe any)
npm test             # Roda os testes unitários do Vitest
npm run build        # Build completo de produção do Next.js
```
