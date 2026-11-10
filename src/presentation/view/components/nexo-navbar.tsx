'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PieChart,
  QrCode,
  Repeat,
  Settings,
  Sparkles,
  Sun,
  WifiOff,
  X,
} from 'lucide-react';
import {
  FirebaseClientManager,
  type NexoAuthUser,
  type PwaStateSnapshot,
  PwaServiceWorkerManager,
  ThemeManager,
  ThemeMode,
  type ThemeSnapshot,
} from '@/core';

export function NexoNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [themeSnap, setThemeSnap] = useState<ThemeSnapshot>(() =>
    ThemeManager.getSnapshot(),
  );
  const [pwaSnap, setPwaSnap] = useState<PwaStateSnapshot>(() =>
    PwaServiceWorkerManager.getSnapshot(),
  );
  const [authUser, setAuthUser] = useState<NexoAuthUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubTheme = ThemeManager.subscribe((next) => setThemeSnap(next));
    const unsubPwa = PwaServiceWorkerManager.subscribe((next) =>
      setPwaSnap(next),
    );
    const unsubAuth = FirebaseClientManager.subscribe((user) =>
      setAuthUser(user),
    );
    ThemeManager.initialize();
    PwaServiceWorkerManager.initialize();

    return () => {
      unsubTheme();
      unsubPwa();
      unsubAuth();
    };
  }, []);

  const topNavItems = [
    { href: '/', label: 'Início' },
    { href: '/portal', label: 'Minha Conta' },
    { href: '/portal/pix', label: 'Central PIX' },
    { href: '/portal/contas', label: 'Open Finance' },
    { href: '/portal/assistente', label: 'Relatórios IA' },
    { href: '/arquitetura', label: 'Arquitetura TS' },
  ] as const;

  const mobilePortalRoutes = [
    { href: '/portal', label: 'Visão Geral', icon: Home },
    { href: '/portal/extrato', label: 'Extrato Bancário', icon: FileText },
    { href: '/portal/pix', label: 'Central PIX', icon: QrCode },
    { href: '/portal/contas', label: 'Contas Open Finance', icon: Building2 },
    { href: '/portal/cartoes', label: 'Cartões e Faturas', icon: CreditCard },
    { href: '/portal/custos', label: 'Centros de Custo', icon: PieChart },
    { href: '/portal/assinaturas', label: 'Assinaturas', icon: Repeat },
    { href: '/portal/assistente', label: 'Relatórios IA', icon: Sparkles },
    { href: '/portal/configuracoes', label: 'Configurações', icon: Settings },
  ] as const;

  const themeOptions: readonly {
    readonly mode: ThemeMode;
    readonly title: string;
    readonly icon: typeof Sun;
  }[] = [
    { mode: ThemeMode.SYSTEM, title: 'Tema do Sistema', icon: Monitor },
    { mode: ThemeMode.DARK, title: 'Tema Escuro', icon: Moon },
    { mode: ThemeMode.LIGHT, title: 'Tema Claro', icon: Sun },
  ];

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await FirebaseClientManager.logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/90 backdrop-blur-xl transition-colors">
      {!pwaSnap.isOnline && (
        <div className="bg-[#ff5500] text-white text-xs font-medium py-1 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Modo offline ativo: alterações salvas localmente</span>
        </div>
      )}

      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-8 lg:px-14 xl:px-20">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <img
              src={themeSnap.logoPath}
              alt="Logo Nexo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-heading text-xs sm:text-sm tracking-[0.28em]">
            NE<span className="text-[#ff5500]">X</span>O
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {topNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === '/portal' && pathname === '/app');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? 'text-[#ff5500]'
                    : 'nexo-text-secondary hover:opacity-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seletor de Tema */}
          <div
            className="inline-flex items-center rounded-full nexo-elevated p-0.5"
            role="group"
            aria-label="Seletor de Tema"
          >
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = themeSnap.mode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  title={opt.title}
                  aria-label={opt.title}
                  onClick={() => ThemeManager.setMode(opt.mode)}
                  className={`flex items-center justify-center rounded-full p-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#ff5500] text-white'
                      : 'nexo-text-muted hover:opacity-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          {authUser ? (
            <div className="hidden sm:flex items-center gap-2">
              {!pathname.startsWith('/portal') && pathname !== '/app' && (
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <span>Minha Conta</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => void handleLogout()}
                title="Sair da conta"
                className="inline-flex items-center gap-1.5 rounded-full nexo-elevated px-3.5 py-1.5 text-xs nexo-text-secondary hover:text-[#ff5500] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium nexo-text-secondary hover:opacity-100 px-2.5 py-1.5"
              >
                Entrar
              </Link>
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>Abrir conta</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Botão Menu Hamburger Mobile (3 tracinhos) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Abrir menu de navegação"
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full nexo-elevated nexo-text-secondary hover:text-[#ff5500] transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Gaveta de Navegação Mobile (Sem precisar arrastar abas horizontais) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {mobilePortalRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#ff5500] text-white'
                      : 'nexo-card nexo-text-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{route.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <Link
              href="/arquitetura"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs nexo-text-secondary hover:text-[#ff5500]"
            >
              Documentação Arquitetura TS →
            </Link>

            {authUser ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-1.5 rounded-full nexo-elevated px-4 py-2 text-xs font-medium text-red-500"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Encerrar Sessão</span>
              </button>
            ) : (
              <Link
                href="/login?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-2 text-xs font-medium text-white"
              >
                <span>Abrir Conta</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
