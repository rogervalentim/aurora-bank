import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountStatusBadge } from '@/components/ui/badge';
import { brlFromCents } from '@/lib/format';
import { EMPLOYMENT_LABEL } from '@/lib/labels';
import { useHome } from '@/services/use-home';
import { clearSession, type CustomerSession } from '@/services/session';
import { loadSession } from '@/services/session';

/** Perfil: dados da conta, status e saída. */
export default function ProfileScreen() {
  const { account } = useHome();
  const [session, setSession] = useState<CustomerSession | null>(null);

  useEffect(() => {
    void loadSession().then(setSession);
  }, []);

  const signOut = async () => {
    await clearSession();
    router.replace('/onboarding');
  };

  return (
    <Screen title="Perfil" testID="profile-screen">
      <Card className="mb-4 gap-1">
        <Text variant="title">{account?.fullName ?? session?.fullName ?? 'Cliente Aurora'}</Text>
        <Text variant="caption">{account?.email ?? session?.email ?? '—'}</Text>
        {account ? <View className="mt-2"><AccountStatusBadge status={account.status} /></View> : null}
      </Card>

      {account ? (
        <Card className="mb-4 gap-3">
          <Row label="CPF" value={account.cpf} />
          <Row label="Vínculo" value={EMPLOYMENT_LABEL[account.employmentType]} />
          <Row label="Renda declarada" value={brlFromCents(account.monthlyIncomeCents)} />
          <Row label="Margem consignável" value={brlFromCents(Math.round(account.monthlyIncomeCents * 0.35))} />
          <Row label="Saldo" value={brlFromCents(account.balanceCents)} />
        </Card>
      ) : null}

      <Button title="Sair da conta" variant="danger" onPress={() => void signOut()} fullWidth testID="profile-sign-out" />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text variant="caption">{label}</Text>
      <Text className="text-[14px] font-semibold text-ink">{value}</Text>
    </View>
  );
}
