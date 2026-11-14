import React, { useState } from 'react';
import AuthScreen, { UserProfile } from './src/screens/AuthScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  if (!currentUser) {
    return <AuthScreen onAuthenticate={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <AuthScreen
    />
  );
}