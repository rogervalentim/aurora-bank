import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './text';
import { cn } from '@/lib/cn';

interface ScreenProps {
  readonly title?: string | undefined;
  readonly subtitle?: string | undefined;
  readonly children: ReactNode;
  readonly scroll?: boolean;
  readonly className?: string | undefined;
  readonly testID?: string | undefined;
}

export function Screen({ title, subtitle, children, scroll = true, className, testID }: ScreenProps) {
  const header = title ? (
    <View className="gap-1 px-5 pb-4 pt-2">
      <Text variant="display">{title}</Text>
      {subtitle ? <Text className="text-[14px] leading-5 text-muted">{subtitle}</Text> : null}
    </View>
  ) : null;

  if (!scroll) {
    return (
      <SafeAreaView className={cn('flex-1 bg-paper', className)} testID={testID}>
        {header}
        <View className="flex-1 px-5">{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn('flex-1 bg-paper', className)} testID={testID}>
      <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        {header}
        <View className="px-5">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
