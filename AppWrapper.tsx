
import React, { useState, useEffect } from 'react';
import App from './App';
import AuthPage from './components/AuthPage';
import { FullScreenLoader } from './components/FullScreenLoader';

const AppWrapper: React.FC = () => {
  // We use a user object to store user data, null means logged out.
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On initial load, check localStorage to see if the user was already logged in.
  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem('user');
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (userData: { name: string; email: string }) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Show a loader while checking for the session
  if (isLoading) {
    return <FullScreenLoader message="Carregando sessão..." />;
  }

  // If there's no user, show the authentication page.
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // If a user is logged in, show the main application.
  return <App user={user} onLogout={handleLogout} />;
};

export default AppWrapper;
