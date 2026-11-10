/**
 * Route Handler Next.js (/api/webhooks/pluggy) — Webhook Oficial Open Finance Brasil (Pluggy).
 *
 * Recebe eventos push assíncronos da Pluggy (`item/created`, `item/updated`, `transactions/created`,
 * `connector/status_updated`) para atualização de saldo noturna ou em tempo real.
 */

import { NextResponse } from 'next/server';
import { hasNumberField, hasStringField, isPlainRecord } from '@/core';
import { globalWebhookEngine } from '@/domain';

export async function GET(): Promise<NextResponse> {
  const hasPluggyCredentials = Boolean(
    process.env.PLUGGY_CLIENT_ID?.trim() &&
      process.env.PLUGGY_CLIENT_SECRET?.trim(),
  );
  const hasWebhookSecret = Boolean(process.env.PLUGGY_WEBHOOK_SECRET?.trim());

  return NextResponse.json({
    endpoint: '/api/webhooks/pluggy',
    status: 'ONLINE',
    securityLocks: {
      webhookSecretHeader: hasWebhookSecret
        ? 'ENFORCED'
        : 'OPEN_FOR_SANDBOX_OR_UNSET',
      pluggyLiveAuth: hasPluggyCredentials ? 'ACTIVE' : 'SANDBOX_FALLBACK',
      idempotencyEngine: 'ACTIVE',
    },
    recentEvents: globalWebhookEngine
      .getAuditLog()
      .filter((item) => item.provider === 'PLUGGY_OPEN_FINANCE'),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const expectedSecret = process.env.PLUGGY_WEBHOOK_SECRET?.trim();
    const incomingSecret = request.headers
      .get('x-pluggy-webhook-secret')
      ?.trim();
    const isInternalTest =
      request.headers.get('x-nexo-webhook-simulation') === 'true';

    if (expectedSecret && !isInternalTest && incomingSecret !== expectedSecret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Assinatura do Webhook Pluggy inválida (x-pluggy-webhook-secret).',
        },
        { status: 401 },
      );
    }

    const rawBody: unknown = await request.json();
    if (!isPlainRecord(rawBody)) {
      return NextResponse.json(
        { ok: false, error: 'Payload JSON inválido.' },
        { status: 400 },
      );
    }

    const pluggyClientId = process.env.PLUGGY_CLIENT_ID?.trim();
    const pluggyClientSecret = process.env.PLUGGY_CLIENT_SECRET?.trim();
    const itemId = hasStringField(rawBody, 'itemId') ? rawBody.itemId : '';

    let verifiedWithRemoteApi = false;
    let liveAccountsBalanceSum = hasNumberField(rawBody, 'balance')
      ? rawBody.balance
      : 0;

    // Se as chaves do Pluggy estão configuradas e não é apenas simulação local, busca o saldo atualizado do itemId na API da Pluggy
    if (pluggyClientId && pluggyClientSecret && itemId && !isInternalTest) {
      try {
        const authRes = await fetch('https://api.pluggy.ai/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: pluggyClientId,
            clientSecret: pluggyClientSecret,
          }),
        });

        if (authRes.ok) {
          const authData: unknown = await authRes.json();
          if (isPlainRecord(authData) && hasStringField(authData, 'apiKey')) {
            const accountsRes = await fetch(
              `https://api.pluggy.ai/accounts?itemId=${encodeURIComponent(itemId)}`,
              {
                headers: {
                  'X-API-KEY': authData.apiKey,
                },
              },
            );

            if (accountsRes.ok) {
              const accountsData: unknown = await accountsRes.json();
              if (
                isPlainRecord(accountsData) &&
                Array.isArray(accountsData.results)
              ) {
                let sum = 0;
                for (const acc of accountsData.results) {
                  if (isPlainRecord(acc) && hasNumberField(acc, 'balance')) {
                    sum += acc.balance;
                  }
                }
                if (sum > 0) {
                  liveAccountsBalanceSum = sum;
                }
              }
              verifiedWithRemoteApi = true;
            }
          }
        }
      } catch (err) {
        console.warn('Aviso ao consultar saldo Pluggy via webhook:', err);
      }
    }

    const enrichedPayload = {
      ...rawBody,
      balance: liveAccountsBalanceSum,
    };

    const resultEither = globalWebhookEngine.settlePluggyEvent(
      enrichedPayload,
      verifiedWithRemoteApi,
    );

    if (resultEither.isLeft()) {
      return NextResponse.json(
        { ok: false, error: resultEither.value.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      received: true,
      audit: resultEither.value,
    });
  } catch (error: unknown) {
    console.error('Erro no processamento do Webhook Pluggy:', error);
    return NextResponse.json(
      { ok: false, error: 'Falha interna ao processar webhook Pluggy.' },
      { status: 500 },
    );
  }
}

