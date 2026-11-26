import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/cn';

interface FieldProps extends TextInputProps {
  readonly label: string;
  readonly error?: string | null;
  readonly hint?: string;
}

export function Field({ label, error, hint, className, ...props }: FieldProps & { className?: string }) {
  return (
    <View className="gap-1.5">
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#94A3B8"
        className={cn(
          'rounded-2xl border bg-white px-4 py-3.5 text-[15px] text-ink',
          error ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      />
      {error ? (
        <Text className="text-[12px] font-medium text-danger">{error}</Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
}
