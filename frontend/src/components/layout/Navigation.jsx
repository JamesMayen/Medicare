import React, { useState } from "react";
import { Link } from "react-router-dom";
import {Menu,X,Stethoscope,MapPin,MessageCircle,Calendar,User,LogOut,ChevronDown} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../images/logo-4.svg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Find Doctors", icon: Stethoscope, href: "#doctors" },
    { label: "Locations", icon: MapPin, href: "#locations" },
    { label: "AI Assistant", icon: MessageCircle, href: "#chat" },
    { label: "Appointments", icon: Calendar, href: "#appointments" },
  ];

  const fetchUserDetails = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched user details:', data);
        setUserDetails(data);
      } else {
        console.error('Failed to fetch user details:', res.status);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && user) {
      fetchUserDetails();
    }
  };

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
                <div className="relative">
                  <button
                    onClick={handleDropdownToggle}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <User className="w-5 h-5" />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isDropdownOpen && (
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    <div className="relative pt-12 pb-4 px-4">
                      {/* Close button */}
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-sm"
                        aria-label="Close user details"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="pr-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">User Details</h3>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                            <p className="text-base font-semibold text-gray-900">{userDetails?.name || user?.name || 'User'}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-sm text-gray-700 break-words">{userDetails?.email || user?.email || 'email@example.com'}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                            <p className="text-sm font-medium text-blue-600 capitalize bg-blue-50 px-2 py-1 rounded-md inline-block">
                              {userDetails?.role || user?.role || 'user'}
                            </p>
                          </div>

                          {userDetails?.role === 'doctor' && (
                            <div className="border-t pt-3 mt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Doctor Information</h4>
                              <div className="space-y-2 text-xs text-gray-600">
                                {userDetails.specialization && (
                                  <div className="flex justify-between">
                                    <span className="font-medium">Specialization:</span>
                                    <span>{userDetails.specialization}</span>
                                  </div>
                                )}
                                {userDetails.experience && (
                                  <div className="flex justify-between">
                                    <span className="font-medium">Experience:</span>
                                    <span>{userDetails.experience} years</span>
                                  </div>
                                )}
                                {userDetails.workLocation && (
                                  <div className="flex justify-between">
                                    <span className="font-medium">Location:</span>
                                    <span>{userDetails.workLocation}</span>
                                  </div>
                                )}
                                {userDetails.consultationFee && (
                                  <div className="flex justify-between">
                                    <span className="font-medium">Fee:</span>
                                    <span>${userDetails.consultationFee}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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
                    <div className="relative w-full">
                      <button
                        onClick={handleDropdownToggle}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                      >
                        <User className="w-5 h-5" />
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {isDropdownOpen && (
                        <button
                          onClick={() => setIsDropdownOpen(false)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {isDropdownOpen && (
                      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
                        <div className="relative pt-12 pb-4 px-4">
                          {/* Close button */}
                          <button
                            onClick={() => setIsDropdownOpen(false)}
                            className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-sm"
                            aria-label="Close user details"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          <div className="pr-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">User Details</h3>

                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                                <p className="text-base font-semibold text-gray-900">{userDetails?.name || user?.name || 'User'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <p className="text-sm text-gray-700 break-words">{userDetails?.email || user?.email || 'email@example.com'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                                <p className="text-sm font-medium text-blue-600 capitalize bg-blue-50 px-2 py-1 rounded-md inline-block">
                                  {userDetails?.role || user?.role || 'user'}
                                </p>
                              </div>

                              {userDetails?.role === 'doctor' && (
                                <div className="border-t pt-3 mt-3">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Doctor Information</h4>
                                  <div className="space-y-2 text-xs text-gray-600">
                                    {userDetails.specialization && (
                                      <div className="flex justify-between">
                                        <span className="font-medium">Specialization:</span>
                                        <span>{userDetails.specialization}</span>
                                      </div>
                                    )}
                                    {userDetails.experience && (
                                      <div className="flex justify-between">
                                        <span className="font-medium">Experience:</span>
                                        <span>{userDetails.experience} years</span>
                                      </div>
                                    )}
                                    {userDetails.workLocation && (
                                      <div className="flex justify-between">
                                        <span className="font-medium">Location:</span>
                                        <span>{userDetails.workLocation}</span>
                                      </div>
                                    )}
                                    {userDetails.consultationFee && (
                                      <div className="flex justify-between">
                                        <span className="font-medium">Fee:</span>
                                        <span>${userDetails.consultationFee}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
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
