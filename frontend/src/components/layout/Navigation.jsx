import React, { useState } from "react";
import { Link } from "react-router-dom";
import {Menu,X,Stethoscope,MapPin,MessageCircle,Calendar,User,LogOut,ChevronDown} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../images/logo-4.svg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Find Doctors", icon: Stethoscope, href: "#doctors" },
    { label: "Locations", icon: MapPin, href: "#locations" },
    { label: "AI Assistant", icon: MessageCircle, href: "#chat" },
    { label: "Appointments", icon: Calendar, href: "#appointments" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
        src={logo} 
        alt="App Logo" 
        className="w-60 h-60 object-contain" 
      />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            ))}
            {user ? (
              <div className="flex items-center space-x-4 relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">User Details</h3>
                        <button
                          onClick={() => setIsDropdownOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold">Welcome, {user?.name || 'User'}</p>
                      <p className="text-sm text-gray-600">{user?.email || 'email@example.com'}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white font-medium hover:opacity-90 transition"
              >
                Signup
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors px-2"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              ))}
              <div className="flex flex-col space-y-2 px-2">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <User className="w-4 h-4" />
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isDropdownOpen && (
                      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">User Details</h3>
                            <button
                              onClick={() => setIsDropdownOpen(false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-lg font-semibold">Welcome, {user?.name || 'User'}</p>
                          <p className="text-sm text-gray-600">{user?.email || 'email@example.com'}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium hover:opacity-90 transition text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Signup
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
