import { View } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/cn';

/** Valor monetário com dígitos tabulares e cor por direção. */
export function Money({ value, className, tone = 'neutral' }: { value: string; className?: string; tone?: 'neutral' | 'credit' | 'debit' }) {
  const toneClass = tone === 'credit' ? 'text-emerald-600' : tone === 'debit' ? 'text-ink' : 'text-ink';
  return (
    <Text
      className={cn('text-[15px] font-bold', toneClass, className)}
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {value}
    </Text>
  );
}

/** Barra de comprometimento da margem consignável. */
export function MarginBar({ percent }: { percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const over = percent > 35;
  return (
    <View className="gap-1.5">
      <View className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <View
          className={over ? 'h-full rounded-full bg-danger' : 'h-full rounded-full bg-accent'}
          style={{ width: `${clamped}%` }}
          testID="margin-bar-fill"
        />
      </View>
    </View>
  );
}
