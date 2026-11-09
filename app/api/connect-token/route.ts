import { NextResponse } from 'next/server';
import { isPlainRecord } from '@/core';

/**
 * Rota Server-Side Oficial Pluggy Connect Token (/api/connect-token)
 *
 * Implementa a Etapa 3/5 do guia "Integre Open Finance com o Pluggy Connect":
 * 1. Autentica no endpoint oficial `https://api.pluggy.ai/auth` usando `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET`.
 * 2. Gera um `connectToken` seguro em `https://api.pluggy.ai/connect_token` vinculado ao `clientUserId` (UID do Firebase).
 * 3. Retorna `{ accessToken }` para o frontend abrir o widget oficial do Pluggy Connect sem expor segredos no navegador.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const clientId =
    process.env.PLUGGY_CLIENT_ID?.trim() ?? process.env.CLIENT_ID?.trim() ?? '';
  const clientSecret =
    process.env.PLUGGY_CLIENT_SECRET?.trim() ??
    process.env.CLIENT_SECRET?.trim() ??
    '';

  let clientUserId = 'nexo-default-user';
  try {
    const rawBody: unknown = await request.json();
    if (
      isPlainRecord(rawBody) &&
      typeof rawBody.clientUserId === 'string' &&
      rawBody.clientUserId.trim().length > 0
    ) {
      clientUserId = rawBody.clientUserId.trim();
    }
  } catch {
    // Corpo vazio é permitido
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        accessToken: null,
        mode: 'SANDBOX_SIMULATION',
        message:
          'Configure PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET nas variáveis de ambiente da Vercel para emitir Connect Tokens reais.',
      },
      { status: 200 },
    );
  }

  try {
    // 1. Troca Client ID + Client Secret por X-API-KEY na Pluggy
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    const authJson: unknown = await authRes.json();
    if (
      !authRes.ok ||
      !isPlainRecord(authJson) ||
      typeof authJson.apiKey !== 'string'
    ) {
      return NextResponse.json(
        {
          accessToken: null,
          mode: 'SANDBOX_FALLBACK',
          message:
            'Não foi possível autenticar na API Pluggy. Verifique PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET.',
        },
        { status: 200 },
      );
    }

    // 2. Emite o Connect Token oficial para o widget Pluggy Connect
    const tokenRes = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': authJson.apiKey,
      },
      body: JSON.stringify({
        clientUserId,
        options: {
          clientUserId,
        },
      }),
    });

    const tokenJson: unknown = await tokenRes.json();
    if (
      !tokenRes.ok ||
      !isPlainRecord(tokenJson) ||
      typeof tokenJson.accessToken !== 'string'
    ) {
      return NextResponse.json(
        {
          accessToken: null,
          mode: 'SANDBOX_FALLBACK',
          message: 'Falha ao gerar Connect Token na Pluggy.',
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      accessToken: tokenJson.accessToken,
      mode: 'PLUGGY_LIVE',
      clientUserId,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro de rede ao conectar à Pluggy.';
    return NextResponse.json(
      {
        accessToken: null,
        mode: 'SANDBOX_FALLBACK',
        message,
      },
      { status: 200 },
    );
  }
}
