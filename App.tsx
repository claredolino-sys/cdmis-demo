
import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated ? <MainLayout /> : <LoginPage />}
    </div>
  );
};

export default App;
