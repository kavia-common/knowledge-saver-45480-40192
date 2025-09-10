import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthState } from './src/services/auth/useAuthState';
import LoginScreen from './src/screens/auth/LoginScreen';
import CaptureScreen from './src/screens/capture/CaptureScreen';
import FeedScreen from './src/screens/feed/FeedScreen';
import ItemDetailScreen from './src/screens/feed/ItemDetailScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import AIChatScreen from './src/screens/ai/AIChatScreen';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { supabase } from './src/services/supabase/client';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ItemDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  type TabName = 'Feed' | 'Capture' | 'AI' | 'Profile' | 'Settings';
  const iconMap: Record<TabName, keyof typeof Ionicons.glyphMap> = {
    Feed: 'list',
    Capture: 'add-circle',
    AI: 'chatbubbles',
    Profile: 'person-circle',
    Settings: 'settings',
  };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const rn = route.name as TabName;
          const name = iconMap[rn] ?? 'ellipse';
          return <Ionicons name={name} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Capture" component={CaptureScreen} />
      <Tab.Screen name="AI" component={AIChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { session } = useAuthState();
  const linking = useMemo(
    () => ({
      prefixes: ['clipstack://', 'https://'],
      config: {
        screens: {
          Auth: '*',
          Main: {
            screens: {
              Feed: 'feed',
              Capture: 'capture',
              AI: 'ai',
              Profile: 'profile',
              Settings: 'settings',
            },
          },
          ItemDetail: 'item/:id',
        },
      },
    }),
    []
  );

  // Handle OAuth email link deep links for Supabase magic links if used later.
  useEffect(() => {
    const handler = Linking.addEventListener('url', async (event) => {
      const url = event.url;
      // Pass URL to Supabase to handle magic link, even though MVP uses OTP/email sign-in fallback.
      await supabase.auth.exchangeCodeForSession({ provider: 'generic', authCode: url }).catch(() => {});
    });
    return () => {
      handler.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer linking={linking}>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!session ? (
              <Stack.Screen name="Auth" component={LoginScreen} />
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
