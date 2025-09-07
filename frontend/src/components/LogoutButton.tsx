import React from 'react';
import { tokenService } from '../services/auth';

interface LogoutButtonProps {
  onLogout: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onLogout, 
  className = '',
  children = 'Logout'
}) => {
  const handleLogout = () => {
    tokenService.removeToken();
    onLogout();
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${className}`}
    >
      {children}
    </button>
  );
};