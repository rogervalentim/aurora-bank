import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { loadSession } from '@/services/session';

/** Splash: decide entre onboarding e Home a partir da sessão salva. */
export default function IndexScreen() {
  useEffect(() => {
    let active = true;
    void loadSession().then((session) => {
      if (!active) return;
      router.replace(session ? '/home' : '/onboarding');
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-navy">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent">
        <Text className="text-[22px] font-extrabold text-white">A</Text>
      </View>
      <Text className="text-[22px] font-extrabold tracking-tight text-white">Aurora Bank</Text>
      <Text className="text-[13px] text-slate-400">Sua conta digital em segundos</Text>
    </View>
  );
}
