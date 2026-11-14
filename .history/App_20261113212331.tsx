import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/AuthScreen';
import AgentHomeScreen from './src/screens/AgentHomeScreen';
import { Button } from './src/components/ThermoLogo';
import { colors, space, type } from './src/theme';

// Navegação simples por estado (sem dependências extras).
// Quando houver mais telas, trocar por @react-navigation/native.
export default function App() {
  const [user, setUser] = useState(null);

  let screen;
  if (!user) {
    screen = <LoginScreen onAuthenticated={setUser} />;
  } else if (user.role === 'agent') {
    screen = <AgentHomeScreen user={user} onSignOut={() => setUser(null)} />;
  } else {
    // Placeholder: a home do cidadão será a próxima tela.
    screen = (
      <View style={styles.placeholder}>
        <Text style={type.title}>Olá, {user.name.split(' ')[0]}</Text>
        <Text style={[type.body, { marginVertical: space.md, textAlign: 'center' }]}>
          A tela do cidadão será liberada na próxima etapa.
        </Text>
        <Button title="Sair" variant="outline" onPress={() => setUser(null)} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={user?.role === 'agent' ? 'light' : 'dark'} />
      {screen}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.offwhite },
});
