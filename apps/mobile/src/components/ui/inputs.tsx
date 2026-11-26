import { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { onlyDigits, maskCpfForDisplay, formatCurrencyBRL } from '@aurora/shared';
import { Text } from './text';
import { cn } from '@/lib/cn';

interface MoneyInputProps {
  readonly label: string;
  readonly valueCents: number;
  readonly onChangeCents: (cents: number) => void;
  readonly error?: string | null;
  readonly testID?: string;
}

/** Campo monetário com máscara pt-BR (digita 123456 → "1.234,56"). */
export function MoneyInput({ label, valueCents, onChangeCents, error, testID }: MoneyInputProps) {
  const display = valueCents === 0 ? '' : formatCurrencyBRL(valueCents / 100).replace(/^R\$\s?/, '');

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    onChangeCents(digits.length === 0 ? 0 : Number.parseInt(digits, 10));
  };

  return (
    <View className="gap-1.5">
      <Text variant="label">{label}</Text>
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-2xl border bg-white px-4 py-3',
          error ? 'border-danger' : 'border-line',
        )}
      >
        <Text className="text-[15px] font-semibold text-muted">R$</Text>
        <TextInput
          accessibilityLabel={label}
          value={display}
          onChangeText={handleChange}
          placeholder="0,00"
          placeholderTextColor="#94A3B8"
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          className="flex-1 text-[20px] font-bold text-ink"
          style={{ fontVariant: ['tabular-nums'] }}
          testID={testID}
        />
      </View>
      {error ? <Text className="text-[12px] font-medium text-danger">{error}</Text> : null}
    </View>
  );
}

interface CpfInputProps {
  readonly value: string;
  readonly onChange: (digits: string) => void;
  readonly error?: string | null;
}

/** Campo de CPF com máscara 000.000.000-00. */
export function CpfInput({ value, onChange, error }: CpfInputProps) {
  const [focused, setFocused] = useState(false);
  const digits = onlyDigits(value);
  const display = focused || digits.length < 11 ? digits : maskCpfForDisplay(digits);

  return (
    <View className="gap-1.5">
      <Text variant="label">CPF</Text>
      <TextInput
        accessibilityLabel="CPF"
        value={display}
        onChangeText={(text) => onChange(onlyDigits(text).slice(0, 11))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="000.000.000-00"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        maxLength={14}
        className={cn(
          'rounded-2xl border bg-white px-4 py-3.5 text-[15px] text-ink',
          error ? 'border-danger' : 'border-line',
        )}
        style={{ fontVariant: ['tabular-nums'] }}
      />
      {error ? <Text className="text-[12px] font-medium text-danger">{error}</Text> : null}
    </View>
  );
}
