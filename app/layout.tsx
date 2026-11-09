import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Nexo Finance by Exímia Tech | Open Finance, Assistente IA & PIX',
  description:
    'Plataforma de controle financeiro inteligente com integração Open Finance, detecção de gastos estilo Pierre e conta digital PIX Asaas. Arquitetura Limpa (Clean Architecture) e SOLID em TypeScript estrito.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/EXIMIA-FAVICON1.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/EXIMIA-FAVICON2.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/EXIMIA-FAVICON2.png',
    apple: '/EXIMIA-FAVICON2.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7f7' },
    { media: '(prefers-color-scheme: dark)', color: '#185054' },
  ],
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('nexo_theme_preference_v1') || 'SYSTEM';
    var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = saved === 'LIGHT' ? 'light' : (saved === 'DARK' ? 'dark' : (sysDark ? 'dark' : 'light'));
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-[#050a0b] text-white antialiased selection:bg-[#0df0b2]/20 selection:text-[#0df0b2] transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
