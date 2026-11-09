'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  LogOut,
  Monitor,
  Moon,
  Sun,
  WifiOff,
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

  const navItems = [
    { href: '/', label: 'Início' },
    { href: '/portal', label: 'Portal' },
    { href: '/portal/assistente', label: 'Relatórios IA' },
    { href: '/arquitetura', label: 'Arquitetura TS' },
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
    await FirebaseClientManager.logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/85 backdrop-blur-xl transition-colors">
      {!pwaSnap.isOnline && (
        <div className="bg-[#ff5500] text-white text-xs font-medium py-1 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Modo offline ativo: alterações salvas localmente</span>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
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

        <div className="flex items-center gap-2.5">
          {/* Seletor minimalista de Tema */}
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
            <div className="flex items-center gap-2">
              {pathname !== '/portal' && pathname !== '/app' && (
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <span>Portal</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => void handleLogout()}
                title="Sair da conta"
                className="inline-flex items-center gap-1.5 rounded-full nexo-elevated px-3 py-1.5 text-xs nexo-text-secondary hover:text-[#ff5500] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
