import React from "react";
import GoogleAdSense from "../components/Common/GoogleAdSense";

export const Home: React.FC = () => {
  return (
    <section className="background h-screen w-screen flex flex-col justify-between items-center overflow-hidden p-6">
      <div className="flex flex-col justify-center items-center flex-grow max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Welcome to Yesitech</h1>
          <p className="text-gray-300 text-lg mb-6">
            <strong>We craft powerful, modern software solutions that empower businesses worldwide.</strong>
          </p>
          <p className="text-gray-300 text-base md:text-lg mb-8 max-h-40 md:max-h-48 overflow-y-auto">
            Yesitech is a freelance software solution provider which provides software services such as website, restful services & apis using .NET Core, Nodejs and Python, database services using SQL, Mongo & Postgres, advance search using elastic and reporting services using SSRS reports and simple text/hml/csv reports. We also deal in content writing and proof reading along with technical support on your existing projects for feature enhancements and bug fixing. Also deal in hosting and domain using our third party partner.
            Happy to hear back from you with our technical services and support.
          </p>
          <a
            href="/services"
            className="bg-[#7e3af2] text-white px-6 py-3 rounded-lg shadow hover:bg-[#6a2ee6] transition inline-block"
          >
            Explore Our Services
          </a>
        </div>
      </div>
      
      <div className="contact-info py-4">
        Designed & Developed with ❤️ by <span className="text-white">Yesitech</span>
      </div>
      <div className="footer-ad w-full">
        <GoogleAdSense slot="2430391325" format="auto" responsive={true} />
      </div>
    </section>
  );
};