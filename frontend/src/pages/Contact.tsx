import React from "react";

export const Contact: React.FC = () => {
  const email = "info" + "@" + "yesitech.com";
  
  const handleEmailClick = () => {
    window.location.href = `mailto:${email}?subject=Business Inquiry&body=Hello Yesitech Team,`;
  };

  return (
    <section className="background min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Get in touch with us for any business inquiries or support
          </p>
          <div className="w-20 h-1 bg-[#7e3af2] mx-auto mt-6"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-6">📧</div>
            <h2 className="text-2xl font-bold text-white mb-4">Email Us</h2>
            <p className="text-gray-300 mb-6">
              For business inquiries, support, or partnerships, feel free to reach out to us directly.
            </p>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Our Business Email:</p>
              <p className="text-xl font-mono text-white break-all">{email}</p>
            </div>

            <button
              onClick={handleEmailClick}
              className="bg-[#7e3af2] hover:bg-[#6a2ee6] text-white font-medium py-3 px-8 rounded-lg transition duration-300 w-full"
            >
              Send Email
            </button>
            
            <p className="text-gray-400 text-sm mt-4">
              Clicking will open your default email client
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            We typically respond within 24 hours
          </p>
        </div>
      </div>
    </section>
  );
};