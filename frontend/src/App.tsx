import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthContainer } from './components/AuthContainer';
import { tokenService } from './services/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Common/Navbar";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { Products } from './pages/Products';
import { Contact } from './pages/Contact';
import { ToastContainer } from 'react-toastify';

// Protected Route Component
const ProtectedRoute = ({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: JSX.Element;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenService.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);

  ////   // Clean up URL - remove /login from address bar
  //   if (window.location.pathname === '/login') {
  //     window.history.replaceState(null, '', '/');
  //   }
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

  return (
    <Router>
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<AuthContainer onLogin={handleLogin} />} />
        </Routes>
      </main>

      <footer className="text-center text-gray-500 py-6 border-t mt-8">
        © {new Date().getFullYear()} Yesitech. All rights reserved.
      </footer>
    </Router>
  );
}

export default App;