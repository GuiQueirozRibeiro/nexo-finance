import { describe, expect, it } from 'vitest';
import { AppFlavor, InstitutionCode } from '@/core';
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
});
