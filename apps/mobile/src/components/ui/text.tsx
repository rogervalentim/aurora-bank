import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/lib/cn';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'label' | 'caption' | 'money';

const variants: Record<Variant, string> = {
  display: 'text-[30px] leading-[36px] font-extrabold tracking-tight text-ink',
  title: 'text-[20px] leading-7 font-bold text-ink',
  subtitle: 'text-[15px] leading-6 font-semibold text-ink',
  body: 'text-[14px] leading-5 text-ink',
  label: 'text-[11px] leading-4 font-semibold uppercase tracking-[0.08em] text-muted',
  caption: 'text-[12px] leading-4 text-muted',
  money: 'text-[28px] leading-9 font-extrabold text-ink',
};

export function Text({ variant = 'body', className, ...props }: TextProps & { variant?: Variant }) {
  return <RNText className={cn(variants[variant], className)} {...props} />;
}
