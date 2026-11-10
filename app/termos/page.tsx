import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scale, Check, AlertCircle } from 'lucide-react';
import { NexoNavbar } from '@/presentation/view/components/nexo-navbar';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Termos e condições gerais de uso dos serviços e da conta digital Nexo Finance.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen nexo-page flex flex-col">
      <NexoNavbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs nexo-text-secondary hover:text-[#ff5500] mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para a página inicial</span>
        </Link>

        <div className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full nexo-elevated px-3 py-1 text-xs text-[#ff5500] font-medium">
            <Scale className="h-3.5 w-3.5" />
            <span>Condições Gerais de Contratação</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl tracking-tight">
            Termos de Uso e Adesão à Conta Nexo
          </h1>
          <p className="text-sm nexo-text-secondary">
            Vigência: Novembro de 2026 • Regulado pelas normas do Sistema de Pagamentos Brasileiro (SPB) e Banco Central do Brasil.
          </p>
        </div>

        <div className="nexo-card rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed nexo-text-secondary">
          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-[#ff5500]" />
              1. Objeto e Natureza da Conta
            </h2>
            <p>
              O presente contrato disciplina as condições de abertura, utilização e encerramento da <strong>Conta de Pagamento Nexo</strong>, provida em parceria com instituições de pagamento homologadas pelo Banco Central do Brasil (BaaS Asaas). A conta permite movimentações via PIX instantâneo, liquidação de títulos, consolidação Open Finance e gestão financeira inteligente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#ff5500]" />
              2. Cadastro, Validação de Identidade e Compliance
            </h2>
            <p>
              Para abertura da conta, o titular declara a autenticidade dos dados fornecidos, comprometendo-se a submeter documentação oficial e prova de vida facial biométrica em conformidade com as diretrizes de Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo (PLD/FT).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#ff5500]" />
              3. Segurança, Biometria e Responsabilidades
            </h2>
            <p>
              O acesso ao aplicativo é estritamente pessoal e intransferível. O titular é o único responsável pela guarda de seu dispositivo e pela não permissão de acesso de terceiros à sua biometria (Face ID / Sensor Digital) ou credenciais de acesso. O Nexo disponibiliza proteções como Modo Rua e limites diurnos e noturnos regulamentados pela Resolução BCB nº 142/2021.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-[#ff5500]" />
              4. Atendimento e Canal de Ouvidoria
            </h2>
            <p>
              Para esclarecimentos, dúvidas operacionais ou suporte transacional, o titular poderá entrar em contato através do e-mail oficial{' '}
              <a href="mailto:suporte@eximiatech.com.br" className="text-[#ff5500] hover:underline font-medium">
                suporte@eximiatech.com.br
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
