import { Tabs } from 'expo-router';
import { Text } from 'react-native';

/** Abas do cliente: Início, Extrato e Perfil. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF', height: 64, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Início', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>◉</Text> }}
      />
      <Tabs.Screen
        name="statement"
        options={{ title: 'Extrato', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>≡</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>☰</Text> }}
      />
    </Tabs>
  );
}
