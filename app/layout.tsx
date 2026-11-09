import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Nexo Finance by Exímia Tech | Open Finance, Assistente IA & PIX',
  description:
    'Plataforma de controle financeiro inteligente com integração Open Finance, detecção de gastos estilo Pierre e conta digital PIX Asaas. Arquitetura Limpa (Clean Architecture) e SOLID em TypeScript estrito.',
  icons: {
    icon: '/EXIMIA-LOGO5-C.png',
    shortcut: '/EXIMIA-FAVICON2.png',
    apple: '/EXIMIA-FAVICON2.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#185054',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#050a0b] text-white antialiased selection:bg-[#0df0b2]/20 selection:text-[#0df0b2]">
        {children}
      </body>
    </html>
  );
}
