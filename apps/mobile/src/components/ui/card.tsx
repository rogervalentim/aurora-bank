import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('rounded-3xl border border-line bg-card p-5', className)}
      style={{ shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      {...props}
    />
  );
}
