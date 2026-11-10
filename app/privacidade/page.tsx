import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { NexoNavbar } from '@/presentation/view/components/nexo-navbar';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Diretrizes de privacidade, proteção de dados e compliance LGPD do Nexo Finance.',
};

export default function PrivacidadePage() {
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
            <Shield className="h-3.5 w-3.5" />
            <span>Compliance LGPD & BACEN</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl tracking-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-sm nexo-text-secondary">
            Última atualização: 10 de Novembro de 2026 • Em conformidade com a Lei nº 13.709/2018 (LGPD) e Resoluções BACEN nº 142/2021 e nº 1/2020.
          </p>
        </div>

        <div className="nexo-card rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed nexo-text-secondary">
          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#ff5500]" />
              1. Nosso Compromisso com a sua Privacidade
            </h2>
            <p>
              O <strong>Nexo Finance</strong> (desenvolvido por Exímia Tech) respeita e protege a privacidade de seus usuários. Esta Política descreve como tratamos, coletamos, armazenamos e protegemos seus dados pessoais e dados bancários quando você utiliza nossos aplicativos móveis e plataforma web.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#ff5500]" />
              2. Dados Coletados e Finalidade
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-foreground">Dados Cadastrais (KYC):</strong> Nome completo, CPF/CNPJ, e-mail, telefone e endereço, exigidos pelo Banco Central para abertura e manutenção de contas de pagamento.
              </li>
              <li>
                <strong className="text-foreground">Biometria e Prova de Vida:</strong> Leitura facial ou biométrica exclusivamente processada no hardware local do seu dispositivo (Apple Secure Enclave e Android KeyStore) para autorização transacional e prevenção a fraudes.
              </li>
              <li>
                <strong className="text-foreground">Dados Financeiros e Open Finance:</strong> Saldos, extratos e lançamentos obtidos mediante seu consentimento expresso e revogável, conforme o padrão Open Finance Brasil do Banco Central.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#ff5500]" />
              3. Segurança da Informação e Criptografia
            </h2>
            <p>
              Todas as comunicações entre seu aplicativo e nossos servidores utilizam protocolos criptográficos avançados (TLS 1.3 / HTTPS com Perfect Forward Secrecy). As chaves de serviço e tokens transacionais permanecem isolados em infraestrutura de nuvem segura, sem exposição a terceiros ou vazamentos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#ff5500]" />
              4. Direitos do Titular de Dados (Art. 18 da LGPD)
            </h2>
            <p>
              Você tem direito a confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou inexatos, revogar consentimentos Open Finance a qualquer instante e solicitar a exclusão definitiva de sua conta através de nosso canal de Encarregado de Proteção de Dados (DPO):{' '}
              <a href="mailto:privacidade@eximiatech.com.br" className="text-[#ff5500] hover:underline font-medium">
                privacidade@eximiatech.com.br
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
