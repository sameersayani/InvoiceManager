import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { tokenService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenService.getToken());
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = tokenService.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    tokenService.removeToken();
    setIsAuthenticated(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationSuccess(true);
    setShowRegister(false); // Switch back to login form
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
if (!isAuthenticated) {
    if (showRegistrationSuccess) {
      return (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToRegister={() => {
            setShowRegistrationSuccess(false);
            setShowRegister(true);
          }}
          registrationSuccess={true}
        />
      );
    }
    
    return showRegister ? (
      <RegisterForm
        onRegister={handleLogin}
        onSwitchToLogin={() => setShowRegister(false)}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    ) : (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;