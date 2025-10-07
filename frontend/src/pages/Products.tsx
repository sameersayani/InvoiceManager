import React from "react";
import { useNavigate } from "react-router-dom";
import { tokenService } from "../services/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleAdSense from "../components/Common/GoogleAdSense";

export const Products: React.FC = () => {
  const navigate = useNavigate();
  
  const products = [
    {
      id: 1,
      name: "Invygo",
      tagline: "Free Invoice Generator",
      description: "Streamline your business operations with our completely free invoice generator. Create professional invoices instantly for your day-to-day business needs.",
      features: [
        "Generate unlimited invoices completely free",
        "Professional invoice templates",
        "Easy-to-use interface",
        "Download and share invoices instantly",
        "No registration required",
        "Available 24/7"
      ],
      benefits: [
        "Save time on manual invoice creation",
        "Maintain professional appearance with clients",
        "Access from anywhere, anytime",
        "Focus on your business while we handle the paperwork"
      ],
      icon: "📄"
    },
    {
      id: 2,
      name: "Expensely",
      tagline: "Smart Expense Tracker",
      description: "Take control of your finances with our comprehensive expense tracking system. Monitor your spending patterns and optimize your savings over time.",
      features: [
        "Daily expense tracking and categorization",
        "Visual spending analytics and reports",
        "Budget planning and monitoring",
        "Multi-device synchronization",
        "Expense reminders and alerts",
        "Data export capabilities"
      ],
      benefits: [
        "Identify unnecessary spending habits",
        "Plan better budgets based on actual data",
        "Achieve long-term financial goals",
        "Make informed financial decisions"
      ],
      icon: "💰"
    }
  ];

const handleProductClick = (productName: string) => {
  if (productName === "Invygo") {
    const isAuthenticated = !!tokenService.getToken();
    
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  } else {
    // Show a message for Expensely
    toast.info("Expensely : Expense Management System is coming soon!");
  }
};

  return (
    <section className="background min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover our innovative solutions designed to simplify your business operations and personal finance management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{product.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{cursor:"pointer"}} onClick={() => handleProductClick(product.name)}>
                  {product.name}
                </h2>
                <p className="text-[#7e3af2] font-semibold text-lg" style={{cursor:"pointer"}} onClick={() => handleProductClick(product.name)}>{product.tagline}</p>
              </div>

              <p className="text-gray-300 mb-6 text-center">
                {product.description}
              </p>

              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-[#7e3af2] rounded-full mr-2"></span>
                  Key Features
                </h3>
                <ul className="text-gray-300 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#7e3af2] mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  What You Gain
                </h3>
                <ul className="text-gray-300 space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">★</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 text-center">
                <button 
                  className="bg-[#7e3af2] text-white px-8 py-3 rounded-lg hover:bg-[#6a2ee6] transition duration-300 font-semibold"
                  onClick={() => handleProductClick(product.name)}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            Designed & Developed with ❤️ by <span className="text-white">Yesitech</span>
          </p>
        </div>
        <div className="footer-ad w-full">
        <GoogleAdSense slot="2430391325" format="auto" responsive={true} />
        </div>
      </div>
    </section>
  );
};