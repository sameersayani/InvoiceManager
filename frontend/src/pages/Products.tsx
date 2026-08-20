import React from "react";
import { tokenService } from "../services/auth";
import { toast } from "react-toastify";

const products = [
  { name: "Invygo", label: "SMART INVOICING", icon: "▤", status: "LIVE", desc: "Create polished invoices, manage clients and keep cash flow visible—all from one refreshingly simple workspace.", features: ["Professional invoices", "Client management", "PDF export"] },
  { name: "ExchangeRate API", label: "DEVELOPER API", icon: "⇄", status: "LIVE", desc: "Reliable, current currency exchange data delivered through a developer-friendly API built for global products.", features: ["Current exchange rates", "Multiple currencies", "Simple REST integration"] },
  { name: "Expensely", label: "EXPENSE INTELLIGENCE", icon: "◔", status: "COMING SOON", desc: "A smarter view of business spending, with effortless tracking, useful analytics and budgets that stay on course.", features: ["Smart categorization", "Visual analytics", "Budget monitoring"] },
];

export const Products: React.FC = () => {
  const open = (name: string) => { if (name === "ExchangeRate API") return window.open("https://exchangerate-3.onrender.com/docs", "_blank", "noopener,noreferrer"); if (name === "Invygo") return window.open(tokenService.getToken() ? "/dashboard" : "/login", "_blank", "noopener,noreferrer"); toast.info("Expensely is coming soon. Stay tuned!"); };
  return <div className="site-page"><section className="page-hero products-hero"><div className="page-hero-grid"></div><div><span className="eyebrow"><span></span> PRODUCTS BY YESITECH</span><h1>Small tools.<br/><em>Serious impact.</em></h1><p>Focused digital products that remove friction from everyday work, designed with the same care as our enterprise systems.</p></div><div className="product-visual"><div>Y/</div><span>TOOLS FOR<br/>BETTER WORK</span></div></section>
    <section className="section products-section"><div className="section-heading"><span className="kicker">OUR PRODUCT LAB</span><h2>Useful by design.<br/><em>Simple by choice.</em></h2></div><div className="product-grid">{products.map((product, i) => <article className={`product-card product-${i + 1}`} key={product.name}><div className="product-card-top"><span className="product-icon">{product.icon}</span><span className={`status ${product.status !== "LIVE" ? "soon" : ""}`}><i></i>{product.status}</span></div><small>{product.label}</small><h3>{product.name}</h3><p>{product.desc}</p><ul>{product.features.map(x => <li key={x}>✓ {x}</li>)}</ul><button onClick={() => open(product.name)}>{product.status === "LIVE" ? "Explore product" : "Join the waitlist"} <span>↗</span></button></article>)}</div></section>
    <section className="product-banner"><div><span className="kicker kicker-mint">HAVE A PRODUCT IDEA?</span><h2>We build for clients.<br/><em>We build for ourselves.</em></h2></div><p>That product mindset shapes every client engagement—lean decisions, real user value and a relentless focus on what works.<br/><br/><a href="/contact">Build a product with us →</a></p></section>
  </div>;
};
