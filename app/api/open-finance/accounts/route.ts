/**
 * Route Handler Next.js (/api/open-finance/accounts?itemId=...)
 *
 * Após o usuário concluir a conexão no Pluggy Connect (onSuccess → item.id),
 * esta rota consulta no servidor as contas REAIS daquele item na API da Pluggy
 * (`GET https://api.pluggy.ai/accounts?itemId=`) e devolve saldo, agência e conta.
 *
 * Nenhum dado é inventado: se a Pluggy não retornar contas, a resposta é vazia.
 */

import { NextResponse } from 'next/server';
import { hasNumberField, hasStringField, isPlainRecord } from '@/core';

export interface PluggyRealAccountDto {
  readonly pluggyAccountId: string;
  readonly itemId: string;
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
  readonly balance: number;
  readonly currencyCode: string;
  readonly number: string;
  readonly branch: string;
  readonly connectorName: string;
  readonly connectorImageUrl: string;
  readonly connectorPrimaryColor: string;
}

async function getPluggyApiKey(): Promise<string | null> {
  const clientId = process.env.PLUGGY_CLIENT_ID?.trim() ?? '';
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET?.trim() ?? '';
  if (!clientId || !clientSecret) return null;

  const authRes = await fetch('https://api.pluggy.ai/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!authRes.ok) return null;
  const authJson: unknown = await authRes.json();
  return isPlainRecord(authJson) && hasStringField(authJson, 'apiKey')
    ? authJson.apiKey
    : null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const itemId = url.searchParams.get('itemId')?.trim() ?? '';
  if (!itemId) {
    return NextResponse.json(
      { error: 'Parâmetro itemId é obrigatório.' },
      { status: 400 },
    );
  }

  try {
    const apiKey = await getPluggyApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Credenciais Pluggy ausentes ou inválidas no servidor (PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET).',
        },
        { status: 503 },
      );
    }

    const [itemRes, accountsRes] = await Promise.all([
      fetch(`https://api.pluggy.ai/items/${encodeURIComponent(itemId)}`, {
        headers: { 'X-API-KEY': apiKey, Accept: 'application/json' },
      }),
      fetch(
        `https://api.pluggy.ai/accounts?itemId=${encodeURIComponent(itemId)}`,
        { headers: { 'X-API-KEY': apiKey, Accept: 'application/json' } },
      ),
    ]);

    let connectorName = 'Instituição Open Finance';
    let connectorImageUrl = '';
    let connectorPrimaryColor = '#ff5500';
    let itemStatus = 'UNKNOWN';
    if (itemRes.ok) {
      const itemJson: unknown = await itemRes.json();
      if (isPlainRecord(itemJson)) {
        if (hasStringField(itemJson, 'status')) itemStatus = itemJson.status;
        const connector = itemJson.connector;
        if (isPlainRecord(connector)) {
          if (hasStringField(connector, 'name')) connectorName = connector.name;
          if (hasStringField(connector, 'imageUrl'))
            connectorImageUrl = connector.imageUrl;
          if (hasStringField(connector, 'primaryColor'))
            connectorPrimaryColor = `#${connector.primaryColor.replace('#', '')}`;
        }
      }
    }

    if (!accountsRes.ok) {
      return NextResponse.json(
        {
          error: `A Pluggy recusou a consulta de contas (HTTP ${accountsRes.status}).`,
          itemStatus,
        },
        { status: 502 },
      );
    }

    const accountsJson: unknown = await accountsRes.json();
    const results =
      isPlainRecord(accountsJson) && Array.isArray(accountsJson.results)
        ? accountsJson.results
        : [];

    const accounts: PluggyRealAccountDto[] = [];
    for (const acc of results) {
      if (!isPlainRecord(acc) || !hasStringField(acc, 'id')) continue;
      const bankData = isPlainRecord(acc.bankData) ? acc.bankData : null;
      accounts.push({
        pluggyAccountId: acc.id,
        itemId,
        name: hasStringField(acc, 'name') ? acc.name : connectorName,
        type: hasStringField(acc, 'type') ? acc.type : 'BANK',
        subtype: hasStringField(acc, 'subtype') ? acc.subtype : '',
        balance: hasNumberField(acc, 'balance') ? acc.balance : 0,
        currencyCode: hasStringField(acc, 'currencyCode')
          ? acc.currencyCode
          : 'BRL',
        number: hasStringField(acc, 'number') ? acc.number : '',
        branch:
          bankData && hasStringField(bankData, 'transferNumber')
            ? bankData.transferNumber
            : '',
        connectorName,
        connectorImageUrl,
        connectorPrimaryColor,
      });
    }

    return NextResponse.json({ itemId, itemStatus, accounts });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha de rede ao consultar a Pluggy.',
      },
      { status: 500 },
    );
  }
}

