'use client';

import React, { useRef } from 'react';

export interface CurrencyInputProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly label?: string;
  readonly helperText?: string;
  readonly maxAmount?: number;
  readonly autoFocus?: boolean;
  readonly disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  label = 'Quanto deseja transferir ou cobrar?',
  helperText,
  maxAmount = 1_000_000,
  autoFocus = false,
  disabled = false,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantém os centavos como número inteiro para precisão total sem erros de ponto flutuante
  const cents = Math.min(
    Math.max(0, Math.round(Number.isFinite(value) ? value * 100 : 0)),
    maxAmount * 100,
  );

  const reaisPart = Math.floor(cents / 100).toLocaleString('pt-BR');
  const centsPart = String(cents % 100).padStart(2, '0');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const nextCents = Math.floor(cents / 10);
      onChange(nextCents / 100);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onChange(0);
      return;
    }

    // Se digitou um número 0-9
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = Number(e.key);
      const nextCents = cents * 10 + digit;
      if (nextCents <= maxAmount * 100) {
        onChange(nextCents / 100);
      }
    }
  };

  const handleQuickAdd = (addReais: number) => {
    if (disabled) return;
    const nextCents = Math.min(cents + addReais * 100, maxAmount * 100);
    onChange(nextCents / 100);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (disabled) return;
    onChange(0);
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="cursor-text rounded-3xl nexo-elevated p-6 sm:p-8 text-center space-y-4 border border-[var(--border-subtle)] focus-within:border-[#ff5500] transition-colors"
    >
      {label && (
        <span className="block text-xs uppercase tracking-wider text-muted font-medium">
          {label}
        </span>
      )}

      {/* Input oculto porém acessível para capturar teclado numérico mobile e físico */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={cents.toString()}
        onChange={() => {
          /* controlado pelo onKeyDown */
        }}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={label}
        className="sr-only"
      />

      {/* Display de Valor estilo Nubank / Santander */}
      <div className="flex items-baseline justify-center gap-2 select-none">
        <span className="text-2xl sm:text-3xl font-heading font-medium text-muted">
          R$
        </span>
        <div className="flex items-baseline">
          <span className="text-4xl sm:text-6xl font-heading font-bold tracking-tight text-[#ff5500]">
            {reaisPart}
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-bold text-[#ff5500]">
            ,{centsPart}
          </span>
        </div>
      </div>

      {helperText && (
        <p className="text-xs nexo-text-muted">{helperText}</p>
      )}

      {/* Pills de Atalhos Rápidos */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(10);
          }}
          disabled={disabled}
          className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium hover:border-[#ff5500] transition-colors"
        >
          + R$ 10
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(50);
          }}
          disabled={disabled}
          className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium hover:border-[#ff5500] transition-colors"
        >
          + R$ 50
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(100);
          }}
          disabled={disabled}
          className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium hover:border-[#ff5500] transition-colors"
        >
          + R$ 100
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(500);
          }}
          disabled={disabled}
          className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium hover:border-[#ff5500] transition-colors"
        >
          + R$ 500
        </button>
        {cents > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            disabled={disabled}
            className="rounded-full bg-red-500/10 text-red-500 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors"
          >
            Zerar
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted">
        Digite os números diretamente no teclado. As casas decimais são preenchidas da direita para a esquerda.
      </p>
    </div>
  );
}

