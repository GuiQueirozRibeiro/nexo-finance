import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Nexo: Controle Financeiro, Open Finance e PIX',
  description:
    'Sua vida financeira consolidada em um único lugar. Open Finance, PIX instantâneo e inteligência financeira em uma experiência minimalista.',
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
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
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
      <body className="min-h-screen nexo-page antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
