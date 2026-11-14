import React, { useState } from 'react';
import AuthScreen, { UserProfile } from './src/screens/AuthScreen';

export default function App() {
  return (
    <SafeAreaProvider>
          <AppNavigator />
      </>
    </SafeAreaProvider>
  );
}
}