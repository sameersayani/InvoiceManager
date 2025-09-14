// AuthContainer.tsx
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthContainer: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleLogin = () => {
    // Handle successful login (redirect or update state)
    console.log('User logged in successfully');
  };

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setIsLogin(true); // Switch back to login after successful registration
    
    // Optional: Show a success message on the login form
    setTimeout(() => {
      setRegistrationSuccess(false);
    }, 3000);
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToRegister={handleSwitchToRegister}
        />
      ) : (
        <RegisterForm 
          onRegister={() => {}} // This might not be needed if you're using onRegistrationSuccess
          onSwitchToLogin={handleSwitchToLogin}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};