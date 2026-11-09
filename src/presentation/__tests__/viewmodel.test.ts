import { describe, expect, it } from 'vitest';
import { AppFlavor, InstitutionCode, TransactionCategory } from '@/core';
import { createFinanceViewModel } from '../viewmodel/finance.viewmodel';

describe('Presentation Layer — FinanceViewModel (MVVM Desacoplado)', () => {
  it('deve carregar snapshot inicial, responder via Assistente Pierre e alternar Flavor DEV/PROD', async () => {
    const vm = createFinanceViewModel();
    await vm.resetDemoData();

    expect(vm.state.isLoading).toBe(false);
    expect(vm.state.accounts.length).toBe(4);
    expect(vm.state.summary?.consolidatedBalance).toBeGreaterThan(40000);

    vm.askAssistant('Quais são minhas assinaturas recorrentes?');
    expect(vm.state.assistantHistory.length).toBe(3);
    expect(vm.state.assistantHistory[2]?.text).toContain('Spotify');

    vm.switchFlavor(AppFlavor.PROD);
    expect(vm.state.activeFlavor).toBe(AppFlavor.PROD);
    vm.switchFlavor(AppFlavor.DEV);

    await vm.syncInstitution(InstitutionCode.ASAAS);
    expect(vm.state.feedbackBanner).toContain('Open Finance sincronizado');
  });

  it('deve persistir operacoes CRUD nas 6 tabelas (Contas, Extrato, Cartoes, Custos, Assinaturas e PIX)', async () => {
    const vm = createFinanceViewModel();
    await vm.resetDemoData();

    const bankOk = await vm.connectNewBankAccount({
      id: 'acc-test-bradesco',
      institution: InstitutionCode.BRADESCO,
      nickname: 'Bradesco Prime Teste',
      balance: 12000,
      coordinates: ['237', '1020', '99887-1'],
      consentStatus: 'AUTHORIZED',
      lastSyncIso: new Date().toISOString(),
      colorAccentHex: '#ff5500',
    });
    expect(bankOk).toBe(true);
    expect(vm.state.accounts.length).toBe(5);

    const cardOk = vm.addCreditCard({
      id: 'card-test-1',
      institution: InstitutionCode.NUBANK,
      cardName: 'Nubank Ultravioleta Teste',
      lastFourDigits: '9911',
      brand: 'MASTERCARD_BLACK',
      limits: [0, 20000],
      closingDay: 5,
      dueDay: 12,
      invoiceStatus: 'OPEN',
    });
    expect(cardOk).toBe(true);

    const purchaseOk = await vm.addCardPurchase(
      'card-test-1',
      'AWS Cloud Server',
      450,
      TransactionCategory.SUBSCRIPTIONS,
    );
    expect(purchaseOk).toBe(true);

    const costOk = vm.addCostCenter({
      id: 'cc-test-1',
      category: TransactionCategory.TRANSPORT,
      costCenterName: 'Logistica Corporativa',
      responsibleArea: 'Operacoes',
      thresholds: [800, 1200],
    });
    expect(costOk).toBe(true);

    const subOk = vm.addSubscription({
      id: 'sub-test-1',
      serviceName: 'GitHub Enterprise',
      category: TransactionCategory.SUBSCRIPTIONS,
      institution: InstitutionCode.NUBANK,
      monthlyAmount: 110,
      billingDay: 15,
      status: 'ACTIVE',
    });
    expect(subOk).toBe(true);

    const csv = vm.exportTransactionsCsv();
    expect(csv).toContain('ID,Data,Descricao,Instituicao,Categoria,Tipo,Valor_BRL');
  });
});
