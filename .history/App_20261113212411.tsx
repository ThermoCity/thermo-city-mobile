import React, { useState } from 'react';
import AuthScreen, { UserProfile } from './src/screens/AuthScreen';
import AgentHomeScreen from './src/screens/AgentHomeScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  if (!currentUser) {
    return <AuthScreen onAuthenticate={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <AgentHomeScreen
      user={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}