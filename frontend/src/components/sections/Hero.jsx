import React from "react";
import { Search, MapPin, MessageCircle } from "lucide-react";
import logo from "../images/logo-1.png";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-50">
      {/* ===== Background Image with Overlay ===== */}
      <div className="absolute inset-0">
        <img
          src={logo}
          alt="Modern hospital facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/80" />
      </div>

      {/* ===== Content ===== */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* ===== Headline ===== */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Health,
            <span className="block bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>

          {/* ===== Subtext ===== */}
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Book appointments with trusted doctors, find nearby hospitals, and
            get AI-powered health assistance — all in one place.
          </p>

          {/* ===== Action Buttons ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {/* Find Doctors */}
            <button className="flex items-center cursor-pointer justify-center px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300">
              <Search className="w-5 h-5 mr-2" />
              Find Doctors
            </button>

            {/* Nearby Hospitals */}
            <button className="flex items-center cursor-pointer justify-center px-6 py-3 rounded-lg border border-white text-white font-semibold hover:bg-white/10 transition-all duration-300">
              <MapPin className="w-5 h-5 mr-2" />
              Nearby Hospitals
            </button>

            {/* AI Assistant */}
            <button className="flex items-center cursor-pointer justify-center px-6 py-3 rounded-lg border border-white text-white font-semibold hover:bg-white/10 transition-all duration-300">
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Assistant
            </button>
          </div>

          {/* ===== Stats Section ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-gray-200">Verified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-gray-200">Partner Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-gray-200">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
