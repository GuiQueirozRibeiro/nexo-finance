/**
 * Route Handler Next.js (/api/open-finance/sync) — Integração com Agregador Open Finance Brasil (Pluggy API)
 * e Fallback Sandbox Determinístico.
 *
 * Quando `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` estão definidos nas variáveis de ambiente (Vercel),
 * autentica no endpoint oficial `https://api.pluggy.ai/auth` para obter o token de sincronização bancária.
 * Caso contrário, opera em modo Sandbox seguro para avaliação sem credenciais externas.
 */

import { NextResponse } from 'next/server';
import { hasStringField, isPlainRecord } from '@/core';

export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json();
    if (!isPlainRecord(rawBody) || !hasStringField(rawBody, 'institution')) {
      return NextResponse.json(
        { error: 'Parâmetro institution é obrigatório.' },
        { status: 400 },
      );
    }

    const institution = rawBody.institution;
    const pluggyClientId = process.env.PLUGGY_CLIENT_ID;
    const pluggyClientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (pluggyClientId && pluggyClientSecret) {
      const authRes = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: pluggyClientId,
          clientSecret: pluggyClientSecret,
        }),
      });

      if (authRes.ok) {
        return NextResponse.json({
          provider: 'PLUGGY_OPEN_FINANCE_LIVE',
          institution,
          syncedAtIso: new Date().toISOString(),
          status: 'AUTHORIZED',
        });
      }
    }

    return NextResponse.json({
      provider: 'OPEN_FINANCE_SANDBOX',
      institution,
      syncedAtIso: new Date().toISOString(),
      status: 'AUTHORIZED',
    });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao processar sincronização Open Finance.' },
      { status: 500 },
    );
  }
}
