import React, { useState } from 'react';
import AuthScreen, { UserProfile } from './src/screens/Login';
import LoginScreen from './src/screens/Login';

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          </Stack.Navigator>
    </NavigationContainer>
          
}
}