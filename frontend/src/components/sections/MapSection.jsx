import React, { useState } from "react";
import { MapPin, Navigation, Phone, Star } from "lucide-react";

const MapSection = () => {
  const [selectedHospital, setSelectedHospital] = useState(null);

  // 🏥 Mock hospital data
  const hospitals = [
    {
      id: "1",
      name: "Central Medical Center",
      address: "123 Main St, Downtown",
      distance: 0.8,
      rating: 4.8,
      phone: "+1 (555) 123-4567",
      emergency: true,
      specialties: ["Emergency", "Cardiology", "Surgery"],
    },
    {
      id: "2",
      name: "City General Hospital",
      address: "456 Oak Ave, Midtown",
      distance: 1.2,
      rating: 4.6,
      phone: "+1 (555) 234-5678",
      emergency: false,
      specialties: ["Pediatrics", "Orthopedics", "Dermatology"],
    },
    {
      id: "3",
      name: "Metro Health Clinic",
      address: "789 Pine St, Uptown",
      distance: 2.1,
      rating: 4.4,
      phone: "+1 (555) 345-6789",
      emergency: false,
      specialties: ["Family Medicine", "Internal Medicine"],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-8">
      {/* ========== Map Section ========== */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Nearby Healthcare Facilities</h2>
        </div>

        <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center">
          {/* 🗺 Map Placeholder */}
          <div className="text-center">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-1 text-gray-700">
              Interactive Map
            </h3>
            <p className="text-gray-500 mb-4">
              Map integration ready for Google Maps or Mapbox
            </p>
            <button className="flex items-center justify-center px-4 py-2 cursor-pointer border border-blue-400 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-all">
              <Navigation className="w-4 h-4 mr-2" />
              Use My Location
            </button>
          </div>

          {/* 🔴 Mock map pins */}
          <div className="absolute top-20 left-32 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div className="absolute bottom-32 right-24 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-lg"></div>
          <div className="absolute top-40 right-40 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg"></div>
        </div>
      </div>

      {/* ========== Hospital List ========== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Nearby Facilities</h3>
          <button className="flex items-center px-3 py-1 cursor-pointer border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
            <Navigation className="w-4 h-4 mr-1" />
            Sort by Distance
          </button>
        </div>

        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              selectedHospital?.id === hospital.id
                ? "border-blue-500 shadow-lg bg-blue-50"
                : "border-gray-200 bg-white hover:shadow-md"
            }`}
            onClick={() => setSelectedHospital(hospital)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{hospital.name}</h4>
                <p className="text-sm text-gray-600">{hospital.address}</p>
              </div>
              {hospital.emergency && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-md">
                  Emergency
                </span>
              )}
            </div>

            {/* Rating & Distance */}
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-800">{hospital.rating}</span>
              </div>
              <span className="text-gray-500">{hospital.distance} miles away</span>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              {hospital.specialties.slice(0, 2).map((spec) => (
                <span
                  key={spec}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md"
                >
                  {spec}
                </span>
              ))}
              {hospital.specialties.length > 2 && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                  +{hospital.specialties.length - 2} more
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center  cursor-pointer justify-center text-sm font-medium bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all">
                <Navigation className="w-3 h-3 mr-1" />
                Directions
              </button>
              <button className="flex-1 flex items-center  cursor-pointer justify-center text-sm font-medium border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-all">
                <Phone className="w-3 h-3 mr-1" />
                Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapSection;
