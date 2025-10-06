import React from "react";

export const About: React.FC = () => {
  return (
    <section className="background min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">About Yesitech</h1>
          <div className="w-20 h-1 bg-[#7e3af2] mx-auto mb-8"></div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <p className="text-gray-300 leading-relaxed mb-6 text-lg">
            Yesitech is a forward-thinking technology company specializing in web, mobile,
            and AI-driven solutions. We aim to simplify complex business challenges with
            intuitive and scalable digital products.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg">
            Our team is passionate about innovation, craftsmanship, and collaboration.
            We believe technology should empower, not complicate — and we deliver that vision
            through quality software built to last.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-white font-semibold mb-2">Innovation</h3>
            <p className="text-gray-300 text-sm">Cutting-edge solutions for modern challenges</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-white font-semibold mb-2">Performance</h3>
            <p className="text-gray-300 text-sm">Fast, reliable, and scalable applications</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl mb-4">💎</div>
            <h3 className="text-white font-semibold mb-2">Quality</h3>
            <p className="text-gray-300 text-sm">Craftsmanship in every line of code</p>
          </div>
        </div>
      </div>
    </section>
  );
};