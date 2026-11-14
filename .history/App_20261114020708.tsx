import React, { useState } from 'react';
import AuthScreen, { UserProfile } from './src/screens/AuthScreen';

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="HomePage"
            component={HomePage}
            options={{ headerShown: false }}
          />
          </Stack.Navigator>
          
}
}