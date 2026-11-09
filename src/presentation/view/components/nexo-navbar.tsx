'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Cpu,
  Download,
  LayoutDashboard,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  WifiOff,
} from 'lucide-react';
import {
  type PwaStateSnapshot,
  PwaServiceWorkerManager,
  ThemeManager,
  ThemeMode,
  type ThemeSnapshot,
} from '@/core';

export function NexoNavbar() {
  const pathname = usePathname();
  const [themeSnap, setThemeSnap] = useState<ThemeSnapshot>(() =>
    ThemeManager.getSnapshot(),
  );
  const [pwaSnap, setPwaSnap] = useState<PwaStateSnapshot>(() =>
    PwaServiceWorkerManager.getSnapshot(),
  );

  useEffect(() => {
    const unsubTheme = ThemeManager.subscribe((next) => setThemeSnap(next));
    const unsubPwa = PwaServiceWorkerManager.subscribe((next) =>
      setPwaSnap(next),
    );
    ThemeManager.initialize();
    PwaServiceWorkerManager.initialize();

    return () => {
      unsubTheme();
      unsubPwa();
    };
  }, []);

  const navItems = [
    { href: '/', label: 'VISÃO GERAL', icon: Sparkles },
    { href: '/app', label: 'PAINEL & PIX ASAAS', icon: LayoutDashboard },
    { href: '/arquitetura', label: 'ARQUITETURA & RUBRICA TS', icon: Cpu },
  ] as const;

  const themeOptions: readonly {
    readonly mode: ThemeMode;
    readonly title: string;
    readonly icon: typeof Sun;
  }[] = [
    { mode: ThemeMode.SYSTEM, title: 'Tema do Sistema', icon: Monitor },
    { mode: ThemeMode.DARK, title: 'Tema Escuro (FAVICON2)', icon: Moon },
    { mode: ThemeMode.LIGHT, title: 'Tema Claro (FAVICON1)', icon: Sun },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#185054]/45 bg-[#050a0b]/85 backdrop-blur-xl transition-colors">
      {!pwaSnap.isOnline && (
        <div className="bg-[#ef5000] text-white text-xs font-semibold py-1 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>
            Modo Offline Ativo (PWA Service Worker) — Exibindo dados em cache local
          </span>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#185054]/70 overflow-hidden transition-colors group-hover:border-[#0df0b2]/60">
            <img
              src={themeSnap.logoPath}
              alt="Logo X Exímia Tech"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xs sm:text-sm tracking-[0.26em] text-white">
              NE<span className="text-[#0df0b2]">X</span>O
            </span>
            <span className="text-[10px] tracking-[0.22em] text-[#859a9b] uppercase">
              by Exímia Tech
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium tracking-wider transition-all ${
                  active
                    ? 'bg-[#185054]/45 text-[#0df0b2] border border-[#0df0b2]/40 shadow-[0_0_20px_rgba(13,240,178,0.1)]'
                    : 'text-[#b6c8c6] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Seletor de Tema: Sistema / Escuro / Claro (persistido no localStorage) */}
          <div
            className="inline-flex items-center rounded-xl border border-[#185054]/70 bg-black/60 p-1"
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
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-[#185054] text-[#0df0b2]'
                      : 'text-[#859a9b] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {opt.mode === ThemeMode.SYSTEM
                      ? 'Auto'
                      : opt.mode === ThemeMode.DARK
                        ? 'Escuro'
                        : 'Claro'}
                  </span>
                </button>
              );
            })}
          </div>

          {pwaSnap.canInstall && (
            <button
              type="button"
              onClick={() => void PwaServiceWorkerManager.promptInstall()}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#185054] bg-[#185054]/25 px-2.5 py-1.5 text-xs text-[#0df0b2] hover:bg-[#185054]"
            >
              <Download className="h-3.5 w-3.5" />
              Instalar PWA
            </button>
          )}

          <Link
            href="/arquitetura"
            className="lg:hidden inline-flex items-center gap-1 rounded-lg border border-[#185054] bg-[#185054]/20 px-2.5 py-1.5 text-xs text-[#b6c8c6]"
          >
            <Cpu className="h-3.5 w-3.5 text-[#0df0b2]" />
            TS
          </Link>

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0df0b2]/50 bg-[#0df0b2]/10 px-3 py-2 text-xs font-semibold tracking-wider text-[#0df0b2] transition-all hover:bg-[#0df0b2] hover:text-black"
          >
            <span className="hidden sm:inline">ABRIR APP</span>
            <span className="sm:hidden">APP</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
