import { DashboardGuard } from '@/components/dashboard/dashboard-guard';

export const metadata = { title: 'Dashboard · Aurora Backoffice' };

export default function DashboardPage() {
  return <DashboardGuard />;
}
