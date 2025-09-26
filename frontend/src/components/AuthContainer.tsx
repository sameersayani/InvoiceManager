// AuthContainer.tsx
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
interface AuthContainerProps {
  onLogin: () => void; // Add this interface
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleForgotPassword = () => {
    console.log('Switching to forgot password view');
    setCurrentView('forgot-password');
  };

  // Use the onLogin prop from parent
  const handleLoginSuccess = () => {
    console.log('User logged in successfully');
    onLogin(); // Call the parent's login handler
  };

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setCurrentView('login');
    
    setTimeout(() => {
      setRegistrationSuccess(false);
    }, 3000);
  };

  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordForm 
        onBackToLogin={() => setCurrentView('login')}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterForm
        onRegister={handleRegistrationSuccess}
        onSwitchToLogin={() => setCurrentView('login')}
        onRegistrationSuccess={handleRegistrationSuccess}
        onBack={() => setCurrentView('login')}
      />
    );
  }

  return (
    <LoginForm 
      onLogin={handleLoginSuccess} // Use the new handler
      onSwitchToRegister={() => setCurrentView('register')}
      onForgotPassword={handleForgotPassword}
      registrationSuccess={registrationSuccess}
    />
  );
};