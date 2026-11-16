import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 1. Importe o componente raiz
import { AuthProvider, useAuth } from './src/context/AuthProvider';
import LoginScreen from './src/screens/Login';
import MainTabs from './src/components/MainTabs';
import { BRAND_COLORS } from './src/theme/thermoTheme';

const Stack = createNativeStackNavigator();

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BRAND_COLORS.azulEscuro }}>
        <ActivityIndicator size="large" color={BRAND_COLORS.laranjaSol} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    // 2. Envolva toda a aplicação com o GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppRoutes />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}