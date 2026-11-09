# 01 — O Produto: Nexo Finance (by Exímia Tech)

## O problema e a inspiração

Usuários brasileiros costumam dividir sua vida financeira entre múltiplos bancos (Nubank, Itaú, Inter, Bradesco), cartões de crédito e contas digitais PJ/PF. Isso gera três dores recorrentes:

1. **Fragmentação de saldo e extrato:** difícil enxergar o patrimônio consolidado em um só lugar.
2. **Assinaturas esquecidas e desvios de orçamento:** cobranças recorrentes ou aumentos silenciosos de gastos passam despercebidos até o fechamento da fatura.
3. **Fricção para movimentar e receber valores:** necessidade de gerar cobranças PIX rápidas ou transferir valores entre contas conectadas.

O **Nexo Finance** nasce inspirado em duas referências reais:
- **Pierre Finance (Open Finance + Assistente Financeiro Inteligente):** centraliza múltiplas instituições via protocolo regulamentado do Open Finance, analisa o contexto dos gastos, identifica assinaturas recorrentes/cobranças duplicadas e permite consultar a saúde financeira de forma interativa.
- **Conta Digital & Gateway PIX Asaas:** simula e integra operações de geração de QR Code PIX (cobrança imediata) e transferências PIX com chaves tipadas (`CPF`, `EMAIL`, `PHONE`, `RANDOM`), operando em dois Flavors (`DEV Sandbox` determinístico e `PROD Asaas API`).

## Identidade Visual (Exímia Tech)

O projeto adota a identidade visual oficial da **Exímia Tech**, aproveitando o ícone **X** (`EXIMIA-LOGO5-C.png` e favicons oficiais) integrado ao nome **NE`X`O**, as fontes **Michroma** (títulos tecnológicos) e **Archivo** (leitura fluida de tabelas e relatórios), e a paleta de verdes dessaturados com destaques neon:

| Token | Hex | Aplicação no Nexo Finance |
|---|---|---|
| `eximia-primary-900` | `#185054` | Superfícies principais, bordas estruturais e cabeçalhos |
| `eximia-primary-300` | `#8baba6` | Textos secundários e indicadores neutros |
| `eximia-accent-green` | `#0df0b2` | Receitas, confirmações PIX, status Open Finance ativo e CTAs |
| `eximia-accent-blue` | `#004fff` | Insights do Assistente Inteligente e badges de sincronização |
| `eximia-accent-orange` | `#ef5000` | Alertas de limite de orçamento e despesas críticas |
| `eximia-base-black` | `#050a0b` | Fundo principal de alto contraste (Dark Mode nativo) |

## Foco Acadêmico (TypeScript para Desenvolvimento Front-end)

Conforme o enunciado da disciplina **TypeScript para Desenvolvimento Front-end [26E4_2]**, o coração do projeto reside na **modelagem estrita de tipos, contratos orientados a objetos e regras de negócio sustentáveis**, aplicando **Clean Architecture**, **SOLID** e **MVVM** inspirados no projeto de referência `pos/App_Nasa`.
