import { NextResponse } from 'next/server';

export interface AdminSystemStatusResponse {
  readonly baasProvider: string;
  readonly liquidityReserveBrl: number;
  readonly availableLiquidityBrl: number;
  readonly isLiquidityHealthy: boolean;
  readonly registeredUsersCount: number;
  readonly totalConnectedBanks: number;
  readonly webhookMetrics: {
    readonly totalReceivedToday: number;
    readonly asaasEvents: number;
    readonly pluggyEvents: number;
    readonly successRatePercent: number;
  };
  readonly recentMappedErrors: readonly {
    readonly id: string;
    readonly timestampIso: string;
    readonly type: 'LIQUIDITY_LIMIT' | 'PIX_TIMEOUT' | 'KYC_VALIDATION' | 'OPEN_FINANCE_SYNC';
    readonly technicalMessage: string;
    readonly userFriendlyMessage: string;
    readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export async function GET() {
  const liquidityReserve = 20.0;
  const simulatedAvailable = 20.0;

  const data: AdminSystemStatusResponse = {
    baasProvider: 'Asaas Instituição de Pagamento S.A. (BaaS Homologado)',
    liquidityReserveBrl: liquidityReserve,
    availableLiquidityBrl: simulatedAvailable,
    isLiquidityHealthy: simulatedAvailable >= liquidityReserve,
    registeredUsersCount: 1,
    totalConnectedBanks: 1,
    webhookMetrics: {
      totalReceivedToday: 14,
      asaasEvents: 9,
      pluggyEvents: 5,
      successRatePercent: 100,
    },
    recentMappedErrors: [
      {
        id: 'err-map-001',
        timestampIso: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: 'LIQUIDITY_LIMIT',
        technicalMessage: 'BaaS account balance threshold reached: Requested R$ 25,00 exceeds reserve R$ 20,00',
        userFriendlyMessage: 'Não foi possível concluir o resgate agora. Tente novamente mais tarde ou aguarde a janela de compensação.',
        severity: 'MEDIUM',
      },
      {
        id: 'err-map-002',
        timestampIso: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        type: 'OPEN_FINANCE_SYNC',
        technicalMessage: 'Connector Santander sandbox returned 403 (Test credential restricted)',
        userFriendlyMessage: 'Instituição em modo sandbox. Utilize o conector Pluggy Bank para testes.',
        severity: 'LOW',
      },
    ],
  };

  return NextResponse.json(data);
}
