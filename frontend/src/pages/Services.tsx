import React from "react";

export const Services: React.FC = () => {
  const services = [
    { 
      title: "Web Development", 
      desc: "Build fast, responsive, and user-friendly websites using React, Next.js, and Tailwind CSS.",
      icon: "🌐"
    },
    { 
      title: "Backend APIs", 
      desc: "Develop secure, scalable APIs using FastAPI, Node.js, or .NET Core.",
      icon: "⚙️"
    },
    { 
      title: "Mobile Apps", 
      desc: "Create cross-platform mobile apps using React Native or Flutter.",
      icon: "📱"
    },
    { 
      title: "AI Solutions", 
      desc: "Integrate smart automation and AI assistants to transform your workflow.",
      icon: "🤖"
    },
    { 
      title: "Database Solutions", 
      desc: "Expert database design and management with SQL, MongoDB, and PostgreSQL.",
      icon: "🗄️"
    },
    {
      title: "Rest API Services", 
      desc: "Design and implement RESTful APIs for seamless integration between front-end and back-end systems.",
      icon: "🌐"
    },
    { 
      title: "Technical Support", 
      desc: "Ongoing maintenance, bug fixes, and feature enhancements for existing projects.",
      icon: "🔧"
    },
  ];

  return (
    <section className="background min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Comprehensive technology solutions tailored to your business needs
          </p>
          <div className="w-20 h-1 bg-[#7e3af2] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/contact"
            className="bg-[#7e3af2] text-white px-8 py-3 rounded-lg shadow hover:bg-[#6a2ee6] transition duration-300 font-semibold inline-block"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  );
};