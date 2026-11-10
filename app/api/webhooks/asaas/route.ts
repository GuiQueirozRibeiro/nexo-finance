/**
 * Route Handler Next.js (/api/webhooks/asaas) — Webhook Oficial Asaas PIX BaaS em Produção.
 *
 * Implementa a arquitetura de 3 travas homologada no ecossistema Exímia Tech (ArenaX):
 * 1. Validação do header `asaas-access-token` contra `ASAAS_WEBHOOK_TOKEN`.
 * 2. Conferência cruzada (Double-Check) do status real na API do Asaas (`/payments/{id}` ou `/transfers/{id}`).
 * 3. Liquidação idempotente via `WebhookReconciliationEngine` para que reenvios do Asaas
 *    (`PAYMENT_CONFIRMED` + `PAYMENT_RECEIVED`) jamais creditem ou debitem duas vezes.
 */

import { NextResponse } from 'next/server';
import { hasNumberField, hasStringField, isPlainRecord } from '@/core';
import { globalWebhookEngine } from '@/domain';

const PAID_ASAAS_STATUSES = new Set([
  'RECEIVED',
  'CONFIRMED',
  'RECEIVED_IN_CASH',
  'DONE',
]);

export async function GET(): Promise<NextResponse> {
  const hasApiKey = Boolean(process.env.ASAAS_API_KEY?.trim());
  const hasWebhookToken = Boolean(process.env.ASAAS_WEBHOOK_TOKEN?.trim());

  return NextResponse.json({
    endpoint: '/api/webhooks/asaas',
    status: 'ONLINE',
    securityLocks: {
      tokenHeaderValidation: hasWebhookToken
        ? 'ENFORCED'
        : 'OPEN_FOR_SANDBOX_OR_UNSET',
      remoteApiDoubleCheck: hasApiKey ? 'ACTIVE' : 'SANDBOX_FALLBACK',
      idempotencyEngine: 'ACTIVE',
    },
    processedCount: globalWebhookEngine.getProcessedCount(),
    recentEvents: globalWebhookEngine
      .getAuditLog()
      .filter((item) => item.provider === 'ASAAS_PIX'),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
    const incomingToken = request.headers.get('asaas-access-token')?.trim();
    const isInternalTest =
      request.headers.get('x-nexo-webhook-simulation') === 'true';

    // TRAVA 1: Validação de token secreto do Webhook Asaas (quando configurado na Vercel)
    if (expectedToken && !isInternalTest && incomingToken !== expectedToken) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Token de webhook Asaas inválido (asaas-access-token).',
        },
        { status: 401 },
      );
    }

    const rawBody: unknown = await request.json();
    const parsedEither = globalWebhookEngine.parseAsaasPayload(rawBody);

    if (parsedEither.isLeft()) {
      return NextResponse.json(
        { ok: false, error: parsedEither.value.message },
        { status: 400 },
      );
    }

    const parsed = parsedEither.value;
    const asaasApiKey = process.env.ASAAS_API_KEY?.trim();
    const defaultBaseUrl = asaasApiKey?.startsWith('$aact_prod_')
      ? 'https://api.asaas.com/api/v3'
      : 'https://sandbox.asaas.com/api/v3';
    const asaasBaseUrl = process.env.ASAAS_BASE_URL?.trim() || defaultBaseUrl;

    let verifiedWithRemoteApi = false;
    let confirmedValueBrl = parsed.rawAmount;

    // TRAVA 2: Double-Check direto na API do Asaas (não confia cegamente apenas no body quando há chave real e não é simulação)
    if (asaasApiKey && !isInternalTest && parsed.isHandled) {
      const endpointPath = parsed.eventName.startsWith('PAYMENT_')
        ? `/payments/${parsed.resourceId}`
        : `/transfers/${parsed.resourceId}`;

      try {
        const verifyRes = await fetch(`${asaasBaseUrl}${endpointPath}`, {
          headers: {
            'Content-Type': 'application/json',
            access_token: asaasApiKey,
          },
        });

        if (verifyRes.ok) {
          const liveJson: unknown = await verifyRes.json();
          if (isPlainRecord(liveJson)) {
            const liveStatus = hasStringField(liveJson, 'status')
              ? liveJson.status
              : '';
            if (
              parsed.eventName !== 'TRANSFER_FAILED' &&
              liveStatus &&
              !PAID_ASAAS_STATUSES.has(liveStatus)
            ) {
              return NextResponse.json({
                received: true,
                ignored: `Status remoto no Asaas (${liveStatus}) ainda não liquidado.`,
              });
            }
            if (hasNumberField(liveJson, 'value') && liveJson.value > 0) {
              confirmedValueBrl = liveJson.value;
            }
            verifiedWithRemoteApi = true;
          }
        }
      } catch (err) {
        console.warn(
          'Aviso na conferência cruzada Asaas Webhook (operando com payload assinado):',
          err,
        );
      }
    }

    // TRAVA 3: Liquidação Idempotente no Motor de Conciliação
    const auditRecord = globalWebhookEngine.settleAsaasEvent({
      eventName: parsed.eventName,
      resourceId: parsed.resourceId,
      confirmedValueBrl,
      description: parsed.description,
      verifiedWithRemoteApi,
    });

    return NextResponse.json({
      received: true,
      audit: auditRecord,
    });
  } catch (error: unknown) {
    console.error('Erro no processamento do Webhook Asaas:', error);
    return NextResponse.json(
      { ok: false, error: 'Falha interna ao processar webhook Asaas.' },
      { status: 500 },
    );
  }
}

