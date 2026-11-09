/**
 * Route Handler Next.js (/api/v1/mobile) — BFF (Backend-For-Frontend) Unificado
 * para o App Mobile (React Native / Expo) e Portal Corporativo (Angular).
 *
 * Centraliza todas as operações sensíveis no servidor da Vercel (`nexo.eximiatech.com.br`),
 * garantindo que nenhuma chave privada (`ASAAS_API_KEY`, `PLUGGY_CLIENT_SECRET`)
 * precise existir no bundle do aplicativo mobile ou SPA.
 */

import { NextResponse } from 'next/server';
import { InstitutionCode, isPlainRecord } from '@/core';
import { globalWebhookEngine } from '@/domain';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-nexo-client-platform',
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      service: 'Nexo Finance BFF Gateway (Web + React Native + Angular)',
      version: '1.2.0',
      firestoreCollection: 'users/{uid}/finance/snapshot',
      supportedInstitutions: Object.values(InstitutionCode),
      bacenLimitsBrl: {
        daytimeLimit: 10000,
        nighttimeLimit: 1000,
        singleTransferMax: 5000,
        regulation: 'Resolução BCB nº 142/2021',
      },
      endpoints: {
        pixGateway: '/api/asaas/pix',
        pluggyConnectToken: '/api/connect-token',
        openFinanceSync: '/api/open-finance/sync',
        asaasWebhook: '/api/webhooks/asaas',
        pluggyWebhook: '/api/webhooks/pluggy',
        mobileBff: '/api/v1/mobile',
      },
      webhookAuditLog: globalWebhookEngine.getAuditLog(),
    },
    { headers: CORS_HEADERS },
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await request.json();
    if (!isPlainRecord(rawBody)) {
      return NextResponse.json(
        { ok: false, error: 'Payload inválido.' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        platform:
          request.headers.get('x-nexo-client-platform') ?? 'react-native-expo',
        timestampIso: new Date().toISOString(),
        webhookAuditLog: globalWebhookEngine.getAuditLog(),
      },
      { headers: CORS_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Erro ao processar requisição no BFF Mobile.' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
