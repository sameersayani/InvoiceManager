import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar: React.FC = () => {
  const location = useLocation();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-medium transition ${
      location.pathname === path
        ? "bg-[#7e3af2] text-white"
        : "text-gray-700 hover:bg-[#f6f5ff] hover:text-[#7e3af2]"
    }`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#7e3af2]">Yesitech Solutions</div>

        <div className="space-x-4">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/about" className={linkClass("/about")}>About Us</Link>
          <Link to="/contact" className={linkClass("/contact")}>Contact Us</Link>
          <Link to="/services" className={linkClass("/services")}>Services</Link>
          <Link to="/products" className={linkClass("/products")}>Products</Link>
        </div>
      </div>
    </nav>
  );
};
