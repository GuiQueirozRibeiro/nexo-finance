import { DashboardPage } from '@/presentation/view/dashboard/dashboard-page';

interface ContaDetalhePageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function ContaDetalhePage({
  params,
}: ContaDetalhePageProps) {
  const resolved = await params;
  return (
    <DashboardPage
      initialTab="account_detail"
      selectedAccountIdParam={resolved.id}
    />
  );
}
