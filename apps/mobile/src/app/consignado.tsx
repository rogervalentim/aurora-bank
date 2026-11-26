import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { calculateConsignado } from '@aurora/shared';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/inputs';
import { MarginBar, Money } from '@/components/ui/money';
import { ErrorState } from '@/components/ui/states';
import { brlFromCents, percentFromPoints } from '@/lib/format';
import { INSTALLMENT_OPTIONS, MARGIN_RATE } from '@/lib/labels';
import { submitProposal } from '@/services/banking';
import { normalizeError } from '@/services/http';
import { useHome } from '@/services/use-home';
import { cn } from '@/lib/cn';

const MONTHLY_RATE = 0.0165;

/** Simulador de crédito consignado com a margem de 35% sempre à vista. */
export default function ConsignadoScreen() {
  const { account, reload } = useHome();
  const [amountCents, setAmountCents] = useState(500_000);
  const [installments, setInstallments] = useState<number>(24);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const income = (account?.monthlyIncomeCents ?? 0) / 100;

  const simulation = useMemo(() => {
    if (income <= 0) return null;
    try {
      return calculateConsignado(amountCents / 100, installments, MONTHLY_RATE, income);
    } catch {
      return null;
    }
  }, [amountCents, installments, income]);

  const submit = async () => {
    if (!account || !simulation) return;
    setSending(true);
    setError(null);
    try {
      await submitProposal({ accountId: account.id, amount: amountCents / 100, installments });
      setSent(true);
      reload();
    } catch (cause) {
      setError(normalizeError(cause));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Screen title="Proposta enviada" testID="consignado-sent">
        <Card className="items-center gap-3 py-8">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Text className="text-[22px] font-extrabold text-accent">✓</Text>
          </View>
          <Text variant="title">Em análise</Text>
          <Text className="text-center text-[13px] leading-5 text-muted">
            Sua proposta entrou na mesa de crédito. A resposta chega aqui assim que o analista decidir.
          </Text>
        </Card>
        <View className="mt-5 gap-3">
          <Button title="Voltar ao início" onPress={() => router.replace('/home')} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Crédito consignado" subtitle="A margem de 35% da renda aparece sempre à vista." testID="consignado-screen">
      {error ? (
        <View className="mb-4">
          <ErrorState message={error} />
        </View>
      ) : null}

      <Card className="gap-4">
        <MoneyInput label="Valor do empréstimo" valueCents={amountCents} onChangeCents={setAmountCents} testID="consignado-amount" />

        <View className="gap-2">
          <Text variant="label">Parcelas</Text>
          <View className="flex-row flex-wrap gap-2">
            {INSTALLMENT_OPTIONS.map((option) => {
              const selected = option === installments;
              return (
                <Button
                  key={option}
                  title={`${option}x`}
                  variant={selected ? 'primary' : 'secondary'}
                  onPress={() => setInstallments(option)}
                  testID={`installment-${option}`}
                  className="min-w-[64px] px-3"
                />
              );
            })}
          </View>
        </View>
      </Card>

      {simulation ? (
        <Card className="mt-4 gap-3">
          <View className="flex-row items-end justify-between">
            <View>
              <Text variant="label">Parcela</Text>
              <Text className="text-[26px] font-extrabold text-ink" style={{ fontVariant: ['tabular-nums'] }} testID="consignado-installment">
                {brlFromCents(Math.round(simulation.installmentAmount * 100))}
              </Text>
            </View>
            <Text variant="caption">
              {installments}x · CET {percentFromPoints(simulation.annualCetPercent)}
            </Text>
          </View>

          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text variant="label">Margem comprometida</Text>
              <Text
                className={cn('text-[12px] font-bold', simulation.isWithinMargin ? 'text-emerald-600' : 'text-danger')}
                style={{ fontVariant: ['tabular-nums'] }}
                testID="consignado-margin-percent"
              >
                {percentFromPoints(simulation.committedIncomePercent)}
              </Text>
            </View>
            <MarginBar percent={simulation.committedIncomePercent} />
            <Text variant="caption">
              Limite legal: {brlFromCents(Math.round(simulation.marginLimit * 100))} ({percentFromPoints(MARGIN_RATE * 100, 0)} da renda)
            </Text>
          </View>

          <View className="gap-2 border-t border-line pt-3">
            <SummaryRow label="Total a pagar" value={brlFromCents(Math.round(simulation.totalAmount * 100))} />
            <SummaryRow label="Juros" value={brlFromCents(Math.round(simulation.totalInterest * 100))} />
            <SummaryRow label="Taxa mensal" value="1,65% a.m." />
          </View>
        </Card>
      ) : null}

      <View className="mt-5 gap-3">
        <Button
          title={simulation?.isWithinMargin ? 'Enviar proposta' : 'Parcela acima da margem'}
          onPress={() => void submit()}
          loading={sending}
          disabled={!simulation?.isWithinMargin}
          fullWidth
          testID="consignado-submit"
        />
        <Button title="Cancelar" variant="ghost" onPress={() => router.back()} fullWidth />
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="caption">{label}</Text>
      <Money value={value} />
    </View>
  );
}
