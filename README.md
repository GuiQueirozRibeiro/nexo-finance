# Nexo Finance — by Exímia Tech

Plataforma de **Controle Financeiro Inteligente**, **Open Finance** (inspirada no *Pierre Finance*) e **Conta Digital PIX (Asaas)**, construída para o Projeto de Disciplina de **TypeScript para Desenvolvimento Front-end [26E4_2]** (Instituto Infnet).

O projeto aplica **Clean Architecture (3 camadas + Core)**, **Princípios SOLID**, **MVVM** e **Flavors de Ambiente (`DEV` / `PROD`)** inspirados na arquitetura do projeto [`App_Nasa`](../App_Nasa/README.md).

## Arquitetura do Projeto

```
src/
├── core/                  # Camada Core (100% TypeScript puro)
│   ├── config/            # FlavorConfig (AppFlavor.DEV / AppFlavor.PROD) + Conditional Types
│   ├── either/            # Programação funcional: Either<L, R>, Left, Right, fold, map
│   ├── enums/             # AppFlavor, TransactionCategory, InstitutionCode + exaustividade
│   ├── errors/            # Hierarquia OOP de Failure e Exceptions (LSP / OCP)
│   ├── network/           # IConnectionChecker e BrowserConnectionChecker
│   ├── types/             # Type Guards (unknown), keyof, typeof, Mapped & Conditional Types, assertNever
│   └── usecase/           # Contrato genérico IUseCase<SuccessType, Params> e Singleton NoParams
├── domain/                # Camada Domain (Fase 1 ⏳: Entities OOP, Tuplas, Interfaces de Repositório e UseCases)
├── data/                  # Camada Data (Fase 2 ⏳: Models com fromJson unknown, DataSources e Repositories)
├── legacy/                # Evolução JS -> TS (Fase 3 ⏳: Evidências de refatoração e segurança de tipos)
└── presentation/          # Camada Presentation (Fases 4 e 5 ⏳: ViewModels TS + Views Next.js / Motion)
```

## Status das Fases

| Fase | Descrição | Status |
|---|---|---|
| **Fase 0** | Setup, `tsconfig.json` (`sourceMap: true`), Flavors e Camada `src/core/` | ✅ Concluída |
| **Fase 1** | Camada `src/domain/`: Entities OOP, Tuplas, Contratos de Repositório (SOLID) e UseCases | ⏳ Próxima |
| **Fase 2** | Camada `src/data/`: Models (`unknown` + Type Guards), Open Finance e Integração PIX Asaas | ⏳ Pendente |
| **Fase 3** | Módulo `src/legacy/`: Migração e Refatoração de JavaScript para TypeScript + Testes Unitários | ⏳ Pendente |
| **Fase 4** | Camada `src/presentation/viewmodel/` + Landing Page Cinematográfica (`motion/react`) | ⏳ Pendente |
| **Fase 5** | Web App (`/app`): Open Finance, Assistente Inteligente (estilo Pierre) e PIX Asaas | ⏳ Pendente |
| **Fase 6** | Laboratório da Rubrica (`/arquitetura`) + Relatório Final em PDF (`docs/`) | ⏳ Pendente |

## Documentação Didática (`docs/`)

- [01 — O Produto: Nexo Finance](docs/01-produto.md)
- [02 — Arquitetura: Clean Architecture + SOLID + MVVM](docs/02-arquitetura.md)
- [03 — Mapa da Rubrica (16 itens mapeados no código)](docs/03-mapa-da-rubrica.md)
- [Diário de Fases](docs/diario-de-fases.md)

## Comandos Principais

```bash
npm run dev          # Inicia servidor de desenvolvimento Next.js
npm run typecheck    # Verificação estática de tipos (tsc --noEmit)
npm run build:core   # Transpila a arquitetura TS pura para dist-core/ com Source Maps (.js.map)
npm run lint         # Executa ESLint estrito (zero any)
npm test             # Executa suíte de testes unitários (Vitest)
npm run build        # Build de produção Next.js
```
