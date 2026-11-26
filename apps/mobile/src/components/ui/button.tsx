import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const container: Record<Variant, string> = {
  primary: 'bg-accent active:bg-emerald-600',
  secondary: 'bg-white border border-line active:bg-slate-50',
  ghost: 'bg-transparent active:bg-slate-100',
  danger: 'bg-white border border-danger active:bg-red-50',
};

const label: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-ink',
  danger: 'text-danger',
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  readonly title: string;
  readonly variant?: Variant;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly testID?: string;
}

export function Button({ title, variant = 'primary', loading, fullWidth, className, disabled, ...props }: ButtonProps & { className?: string }) {
  const isDisabled = Boolean(disabled) || Boolean(loading);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4',
        container[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0F172A'} /> : null}
      <Text className={cn('text-[15px] font-bold', label[variant])}>{title}</Text>
    </Pressable>
  );
}
