import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [{ to: "/", label: "Home" }, { to: "/services", label: "Services" }, { to: "/products", label: "Products" }, { to: "/about", label: "About" }];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location.pathname]);
  return <header className="site-header"><nav className="site-nav" aria-label="Main navigation">
    <Link to="/" className="brand" aria-label="Yesitech home"><span className="brand-mark"><span>Y</span></span><span><strong>yesi</strong>tech<small>AI Solutions</small></span></Link>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><span></span><span></span><span></span></button>
    <div className={`nav-links ${open ? "is-open" : ""}`}>{links.map(link => <Link key={link.to} to={link.to} className={location.pathname === link.to ? "active" : ""}>{link.label}</Link>)}<Link to="/contact" className="nav-cta">Start a project <span>↗</span></Link></div>
  </nav></header>;
};
