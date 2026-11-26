import { ActivityIndicator, View } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { cn } from '@/lib/cn';

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <View className="items-center justify-center gap-3 py-16" testID="loading-state">
      <ActivityIndicator color="#10B981" />
      <Text variant="caption">{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="gap-3 rounded-2xl border border-red-200 bg-red-50 p-4" testID="error-state">
      <Text className="text-[13px] font-semibold text-red-700">{message}</Text>
      {onRetry ? <Button title="Tentar novamente" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: { title: string; onPress: () => void } }) {
  return (
    <View className={cn('items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-5 py-10')} testID="empty-state">
      <Text variant="subtitle">{title}</Text>
      {description ? <Text className="text-center text-[13px] text-muted">{description}</Text> : null}
      {action ? <Button title={action.title} variant="secondary" onPress={action.onPress} className="mt-2" /> : null}
    </View>
  );
}
