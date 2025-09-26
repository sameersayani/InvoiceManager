import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthContainer } from './components/AuthContainer';
import { tokenService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenService.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);

     // Clean up URL - remove /login from address bar
    if (window.location.pathname === '/login') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    tokenService.removeToken();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthContainer onLogin={handleLogin} />; // Pass onLogin prop
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;