import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Money } from '@/components/ui/money';
import { AccountStatusBadge } from '@/components/ui/badge';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { brlFromCents, formatShortDate } from '@/lib/format';
import { ACCOUNT_STATUS_DESCRIPTION, EMPLOYMENT_LABEL } from '@/lib/labels';
import { useHome } from '@/services/use-home';

/** Home do cliente: saldo, status do KYC e atalhos. */
export default function HomeScreen() {
  const { account, transactions, loading, error, reload } = useHome();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setRefreshing(false);
  }, [account]);

  if (loading) {
    return (
      <Screen testID="home-screen">
        <LoadingState label="Buscando sua conta…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen testID="home-screen">
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }

  if (!account) {
    return (
      <Screen testID="home-screen">
        <ErrorState message="Conta não encontrada." onRetry={reload} />
      </Screen>
    );
  }

  const isActive = account.status === 'ACTIVE';

  return (
    <Screen testID="home-screen">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text variant="caption">Olá,</Text>
          <Text variant="title">{account.fullName.split(' ')[0]}</Text>
        </View>
        <AccountStatusBadge status={account.status} />
      </View>

      <View className="mb-4 overflow-hidden rounded-3xl bg-navy p-5">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Saldo disponível
        </Text>
        <Text
          className="mt-1 text-[32px] font-extrabold leading-10 text-white"
          style={{ fontVariant: ['tabular-nums'] }}
          testID="home-balance"
        >
          {brlFromCents(account.balanceCents)}
        </Text>
        <Text className="mt-1 text-[12px] text-slate-400">
          {EMPLOYMENT_LABEL[account.employmentType]} · renda {brlFromCents(account.monthlyIncomeCents)}
        </Text>
        <View className="mt-4 flex-row gap-2">
          <Button
            title="Pix"
            variant={isActive ? 'primary' : 'secondary'}
            disabled={!isActive}
            onPress={() => router.push('/pix')}
            testID="home-action-pix"
            className="flex-1"
          />
          <Button
            title="Consignado"
            variant="secondary"
            onPress={() => router.push('/consignado')}
            testID="home-action-consignado"
            className="flex-1"
          />
        </View>
      </View>

      {!isActive ? (
        <Card className="mb-4 gap-1 border-amber-200 bg-amber-50">
          <Text className="text-[13px] font-bold text-amber-800">Conta em análise</Text>
          <Text className="text-[13px] leading-5 text-amber-800">{ACCOUNT_STATUS_DESCRIPTION[account.status]}</Text>
        </Card>
      ) : null}

      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="subtitle">Últimas movimentações</Text>
          <Button title="Ver tudo" variant="ghost" onPress={() => router.push('/statement')} />
        </View>
        {transactions.length === 0 ? (
          <Text variant="caption">Nenhuma movimentação ainda. Faça um Pix para começar.</Text>
        ) : (
          transactions.slice(0, 4).map((transaction) => (
            <View key={transaction.id} className="flex-row items-center justify-between gap-3 border-t border-line pt-3">
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-ink">{transaction.description}</Text>
                <Text variant="caption">{formatShortDate(transaction.createdAt)}</Text>
              </View>
              <Money
                value={`${transaction.direction === 'CREDIT' ? '+' : '−'} ${brlFromCents(transaction.amountCents)}`}
                tone={transaction.direction === 'CREDIT' ? 'credit' : 'debit'}
              />
            </View>
          ))
        )}
      </Card>

      {refreshing ? <LoadingState label="Atualizando…" /> : null}
    </Screen>
  );
}
