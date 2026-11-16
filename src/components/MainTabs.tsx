import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';

import CitizenHomeScreen from '../screens/CitizenHomeScreen';
import CitizenGuideScreen from '../screens/CitizenGuideScreen';
import RegisterForms from '../screens/RegisterForms';

import AgentHomeScreen from '../screens/AgentHomeScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agente';

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLORS.laranjaSol,
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255,255,255,0.45)' : '#7E9F8E',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
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
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          // Ícones compartilhados ou específicos por rota
          if (route.name === 'Home' || route.name === 'AgentHome') {
            iconName = focused ? (isAgent ? 'shield-checkmark' : 'sunny') : (isAgent ? 'shield-checkmark-outline' : 'sunny-outline');
          } else if (route.name === 'Guide') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Register') {
            iconName = focused ? 'pencil' : 'pencil-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
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
            name="Register"
            component={RegisterForms}
            options={{ tabBarLabel: 'Nova Ocorrência' }}
          />
          <Tab.Screen
            name="Guide"
            component={CitizenGuideScreen}
            options={{ tabBarLabel: 'Protocolos' }}
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
            options={{ tabBarLabel: 'Guia do Calor' }}
          />
          <Tab.Screen
            name="Register"
            component={RegisterForms}
            options={{ tabBarLabel: 'Formulário' }}
          />
          <Tab.Screen
            name="Profile"
            component={RegisterForms}
            options={{ tabBarLabel: 'Perfil' }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}