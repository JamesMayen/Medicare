import React, { useState } from "react";
import { Search, Filter, MapPin, X } from "lucide-react";

const SearchFilter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);

  const specialties = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychology",
    "Radiology",
    "Surgery",
  ];

  const locations = [
    "Downtown",
    "Midtown",
    "Uptown",
    "Westside",
    "Eastside",
    "Suburbs",
    "City Center",
  ];

  const quickFilters = [
    "Available Today",
    "Accepts Insurance",
    "Online Consultation",
    "Emergency Care",
    "Walk-in Welcome",
    "Specialist",
  ];

  const addFilter = (filter) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const removeFilter = (filter) => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filter));
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-6 shadow-lg">
      {/* Search Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Search Doctors, Specialties, or Hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {/* Specialty Dropdown */}
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="lg:w-48 py-3 px-3 cursor-pointer rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
        >
          <option value="">Specialty</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty.toLowerCase()}>
              {specialty}
            </option>
          ))}
        </select>

        {/* Location Dropdown */}
        <div className="relative lg:w-48">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full py-3 pl-9 pr-3 cursor-pointer rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
          >
            <option value="">Location</option>
            {locations.map((location) => (
              <option key={location} value={location.toLowerCase()}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white font-medium hover:opacity-90 transition">
          <div className="flex items-center cursor-pointer justify-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </div>
        </button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">
            Quick Filters:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              onClick={() =>
                selectedFilters.includes(filter)
                  ? removeFilter(filter)
                  : addFilter(filter)
              }
              className={`px-3 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center ${
                selectedFilters.includes(filter)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {filter}
              {selectedFilters.includes(filter) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div className="flex items-start flex-wrap gap-2 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">Active:</span>
            {selectedFilters.map((filter) => (
              <div
                key={filter}
                className="flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full text-sm"
              >
                {filter}
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
