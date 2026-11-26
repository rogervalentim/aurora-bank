import { View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Money } from '@/components/ui/money';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { brlFromCents, formatDateTime } from '@/lib/format';
import { useHome } from '@/services/use-home';

/** Extrato completo da conta, com entradas e saídas. */
export default function StatementScreen() {
  const { account, transactions, loading, error, reload } = useHome();

  if (loading) {
    return (
      <Screen title="Extrato" testID="statement-screen">
        <LoadingState label="Carregando extrato…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Extrato" testID="statement-screen">
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen title="Extrato" subtitle={account ? `Saldo ${brlFromCents(account.balanceCents)}` : undefined} testID="statement-screen">
      {transactions.length === 0 ? (
        <EmptyState title="Sem movimentações" description="Suas entradas e saídas aparecem aqui." />
      ) : (
        <Card className="gap-0 p-0">
          {transactions.map((transaction, index) => (
            <View
              key={transaction.id}
              className={`flex-row items-center justify-between gap-3 px-4 py-3.5 ${index > 0 ? 'border-t border-line' : ''}`}
            >
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-ink">{transaction.description}</Text>
                <Text variant="caption">{formatDateTime(transaction.createdAt)}</Text>
              </View>
              <Money
                value={`${transaction.direction === 'CREDIT' ? '+' : '−'} ${brlFromCents(transaction.amountCents)}`}
                tone={transaction.direction === 'CREDIT' ? 'credit' : 'debit'}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
