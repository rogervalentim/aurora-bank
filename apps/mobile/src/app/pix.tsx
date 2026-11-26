import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { onlyDigits } from '@aurora/shared';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { MoneyInput } from '@/components/ui/inputs';
import { ErrorState } from '@/components/ui/states';
import { brlFromCents } from '@/lib/format';
import { sendPix } from '@/services/banking';
import { normalizeError } from '@/services/http';
import { useHome } from '@/services/use-home';

const PIX_MAX_CENTS = 2_000_000;

/** Envio de Pix por chave (CPF, e-mail, telefone ou aleatória). */
export default function PixScreen() {
  const { account, reload } = useHome();
  const [key, setKey] = useState('');
  const [amountCents, setAmountCents] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ id: string; amountCents: number } | null>(null);
  const [sending, setSending] = useState(false);

  const balance = account?.balanceCents ?? 0;

  const validation = useMemo(() => {
    if (key.trim().length < 5) return 'Informe a chave Pix do destinatário.';
    if (amountCents <= 0) return 'Informe o valor do Pix.';
    if (amountCents > balance) return 'Saldo insuficiente para este valor.';
    if (amountCents > PIX_MAX_CENTS) return 'O limite por transferência é de R$ 20.000,00.';
    return null;
  }, [key, amountCents, balance]);

  const submit = async () => {
    if (validation || !account) {
      setError(validation);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const transfer = await sendPix({
        senderAccountId: account.id,
        receiverKey: key.trim(),
        amountCents,
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      setReceipt({ id: transfer.endToEndId, amountCents: transfer.amountCents });
      setKey('');
      setAmountCents(0);
      setDescription('');
      reload();
    } catch (cause) {
      setError(normalizeError(cause));
    } finally {
      setSending(false);
    }
  };

  if (receipt) {
    return (
      <Screen title="Pix enviado" testID="pix-receipt">
        <Card className="items-center gap-3 py-8">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Text className="text-[22px] font-extrabold text-accent">✓</Text>
          </View>
          <Text variant="title">{brlFromCents(receipt.amountCents)}</Text>
          <Text variant="caption">Transferência concluída</Text>
          <Text className="mt-2 text-[11px] text-muted">ID {receipt.id}</Text>
        </Card>
        <View className="mt-5 gap-3">
          <Button title="Enviar outro Pix" variant="secondary" onPress={() => setReceipt(null)} fullWidth />
          <Button title="Voltar ao início" onPress={() => router.replace('/home')} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Enviar Pix" subtitle={`Saldo disponível ${brlFromCents(balance)}`} testID="pix-screen">
      {error ? (
        <View className="mb-4">
          <ErrorState message={error} />
        </View>
      ) : null}

      <Card className="gap-4">
        <Field
          label="Chave Pix"
          value={key}
          onChangeText={setKey}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          autoCapitalize="none"
          keyboardType={onlyDigits(key).length === key.replace(/\D/g, '').length && /^\d+$/.test(key) ? 'number-pad' : 'default'}
        />
        <MoneyInput label="Valor" valueCents={amountCents} onChangeCents={setAmountCents} testID="pix-amount" />
        <Field
          label="Mensagem (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: aluguel de março"
          maxLength={80}
        />
      </Card>

      <View className="mt-5 gap-3">
        <Button
          title="Confirmar Pix"
          onPress={() => void submit()}
          loading={sending}
          disabled={Boolean(validation)}
          fullWidth
          testID="pix-submit"
        />
        <Button title="Cancelar" variant="ghost" onPress={() => router.back()} fullWidth />
      </View>
    </Screen>
  );
}
