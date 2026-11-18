import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Platform, StyleSheet, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthProvider';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';

import CitizenHomeScreen from '../screens/CitizenHomeScreen';
import CitizenGuideScreen from '../screens/CitizenGuideScreen';
import AgentHomeScreen from '../screens/AgentHomeScreen';
import CitizenFamiliarListScreen from '../screens/CitizenFamiliarListScreen';
import CitizenProfileScreen from '../screens/CitizenProfileScreen';
import HealthChatScreen from '../screens/AgentHealthChatScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agente';

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  // Obtém as medidas exatas do notch/StatusBar e da barra inferior do dispositivo
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.navHeader, // Pinta a área da StatusBar da mesma cor do Hero escuro
          paddingTop: insets.top, // Impede que qualquer tela sobreponha a StatusBar globalmente
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneContainerStyle: {
            backgroundColor: theme.background,
          },
          tabBarActiveTintColor: BRAND_COLORS.laranjaSol,
          tabBarInactiveTintColor: isDarkMode ? 'rgba(255,255,255,0.45)' : '#7E9F8E',
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.cardBorder,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home' || route.name === 'AgentHome') {
              iconName = focused
                ? isAgent
                  ? 'shield-checkmark'
                  : 'sunny'
                : isAgent
                ? 'shield-checkmark-outline'
                : 'sunny-outline';
            } else if (route.name === 'Guide') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'FamiliarList') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        {isAgent ? (
          // ───────── ABAS DO AGENTE / GESTOR ─────────
          <>
            <Tab.Screen
              name="AgentHome"
              component={AgentHomeScreen}
              options={{ tabBarLabel: 'Painel Agente' }}
            />
            <Tab.Screen
              name="Chat"
              component={HealthChatScreen}
              options={{ tabBarLabel: 'ThermoCity AI Chat' }}
            />
          </>
        ) : (
          // ───────── ABAS DO CIDADÃO ─────────
          <>
            <Tab.Screen
              name="Home"
              component={CitizenHomeScreen}
              options={{ tabBarLabel: 'Início' }}
            />
            <Tab.Screen
              name="Guide"
              component={CitizenGuideScreen}
              options={{ tabBarLabel: 'Meu Guia' }}
            />
            <Tab.Screen
              name="FamiliarList"
              component={CitizenFamiliarListScreen}
              options={{ tabBarLabel: 'Familiares' }}
            />
            <Tab.Screen
              name="Profile"
              component={CitizenProfileScreen}
              options={{ tabBarLabel: 'Meu Perfil' }}
            />
          </>
        )}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});