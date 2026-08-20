import React from "react";
import { Link } from "react-router-dom";

export const SiteFooter: React.FC = () => <footer className="site-footer">
  <div className="footer-grid"><div><Link to="/" className="brand brand-light"><span className="brand-mark"><span>Y</span></span><span><strong>yesi</strong>tech<small>Solutions</small></span></Link><p>Engineering intelligent software for ambitious businesses—from first idea to global scale.</p></div><div><h4>Company</h4><Link to="/about">About us</Link><Link to="/services">Services</Link><Link to="/products">Products</Link></div><div><h4>Expertise</h4><Link to="/services">AI & data</Link><Link to="/services">Cloud & DevOps</Link><Link to="/services">Software development</Link></div><div><h4>Let's build</h4><a href="mailto:info@yesitech.com">info@yesitech.com</a><Link to="/contact">Start a conversation →</Link></div></div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Yesitech Solutions. All rights reserved.</span><span>Build smarter. Move faster.</span></div>
</footer>;
