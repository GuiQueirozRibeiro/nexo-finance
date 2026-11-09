'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Cpu, LayoutDashboard, Sparkles } from 'lucide-react';

export function NexoNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'VISÃO GERAL', icon: Sparkles },
    { href: '/app', label: 'PAINEL & PIX ASAAS', icon: LayoutDashboard },
    { href: '/arquitetura', label: 'ARQUITETURA & RUBRICA TS', icon: Cpu },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-[#185054]/45 bg-[#050a0b]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#185054]/70 bg-black/80 p-1.5 transition-colors group-hover:border-[#0df0b2]/60">
            <img
              src="/EXIMIA-LOGO5-C.png"
              alt="Logo X Exímia Tech"
              className="h-full w-full object-contain"
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

        <nav className="hidden md:flex items-center gap-2">
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

        <div className="flex items-center gap-2.5">
          <Link
            href="/arquitetura"
            className="md:hidden inline-flex items-center gap-1 rounded-lg border border-[#185054] bg-[#185054]/20 px-2.5 py-1.5 text-xs text-[#b6c8c6]"
          >
            <Cpu className="h-3.5 w-3.5 text-[#0df0b2]" />
            TS
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0df0b2]/50 bg-[#0df0b2]/10 px-3.5 py-2 text-xs font-semibold tracking-wider text-[#0df0b2] transition-all hover:bg-[#0df0b2] hover:text-black"
          >
            ABRIR APP
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
