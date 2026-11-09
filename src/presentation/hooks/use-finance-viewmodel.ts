'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DeepReadonly } from '@/core';
import {
  type FinanceViewModel,
  type FinanceViewState,
  createFinanceViewModel,
} from '../viewmodel/finance.viewmodel';

export function useFinanceViewModel(): {
  readonly viewModel: FinanceViewModel;
  readonly state: DeepReadonly<FinanceViewState>;
} {
  const viewModel = useMemo(() => createFinanceViewModel(), []);
  const [state, setState] = useState<DeepReadonly<FinanceViewState>>(
    () => viewModel.state,
  );

  useEffect(() => {
    const unsubscribe = viewModel.subscribe((nextState) => {
      setState(nextState);
    });
    void viewModel.loadDashboard();
    return unsubscribe;
  }, [viewModel]);

  return { viewModel, state };
}
