import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { LayoutDashboard, Users, Calendar, FileText, Settings, Activity } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function TabLayout() {
  const { doctor } = useAuthStore();
  const clinicName = doctor?.clinicName || 'Dashboard';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: '#e2e8f0',
          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 2,
          elevation: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
          color: '#0f172a',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                <Activity size={18} color="#0ea5e9" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>{clinicName}</Text>
            </View>
          ),
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
