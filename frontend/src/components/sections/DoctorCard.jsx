import React from "react";
import { useState } from "react";
import { Star, MapPin, Calendar, Clock, MessageCircle } from "lucide-react";
import logo1 from "../images/logo-1.png";
import logo2 from "../images/logo-2.png";
import logo4 from "../images/logo-4.svg";
// import DoctorsPage from "./DoctorPage";


const doctors = [
    {
      name: "Dr. Amina Lado",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 150,
      experience: 12,
      hospital: "Gaida Hospital",
      location: "Jebel, Gaida",
      image: logo1,
      availableToday: true,
      consultationFee: 50,
    },
    {
      name: "Dr. John Lokudu Mike",
      specialty: "Nurse",
      rating: 5.9,
      reviews: 200,
      experience: 8,
      hospital: "Muniki Hospital",
      location: "Muniki",
      image: logo2,
      availableToday: false,
      consultationFee: 20,
    },
    {
      name: "Dr. Mary Agnes",
      specialty: "Clinical Oficer",
      rating: 3.9,
      reviews: 120,
      experience: 5,
      hospital: "Gudele Hospital",
      location: "Gudele",
      image: logo4,
      availableToday: true,
      consultationFee: 10,
    },
  ];

// ✅ DoctorCard component

const DoctorCard = () => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
    {doctors.map((doctor,index) => (
      <div key={index} className="">

    <div className=" group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* ===== Doctor Image ===== */}
      <div className=" flex flex-col gap-4  p-2">
        <img
          src={doctor.image}
          alt={`Dr. ${doctor.name}`}
          className="w-sm h-sm object-cover group-hover:scale-105 transition-transform duration-300"/>
        {doctor.availableToday && (
          <span className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">
            Available Today
          </span>
        )}
      </div>

      {/* ===== Doctor Info ===== */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Dr. {doctor.name}
          </h3>
          <p className="text-sm text-gray-500">{doctor.specialty}</p>
        </div>

        {/* ===== Rating & Experience ===== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-800">{doctor.rating}</span>
            <span className="text-gray-500 text-sm">
              ({doctor.reviews} reviews)
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {doctor.experience} yrs exp.
          </div>
        </div>

        {/* ===== Location ===== */}
        <div className="flex items-start space-x-2 text-gray-500">
          <MapPin className="w-4 h-4 mt-0.5" />
          <div>
            <div className="font-medium text-gray-800">
              {doctor.hospital}
            </div>
            <div className="text-sm">{doctor.location}</div>
          </div>
        </div>

        {/* ===== Consultation Fee ===== */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Consultation</span>
          </div>
          <span className="text-lg font-semibold text-blue-600">
            ${doctor.consultationFee}
          </span>
        </div>

        {/* ===== Action Buttons ===== */}
        <div className="flex gap-2 pt-4">
          <button className="flex-1 flex items-center justify-center cursor-pointer bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-500 transition-all">
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </button>
          <button className="p-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition">
            <MessageCircle className="w-4 cursor-pointer h-4 text-blue-600" />
          </button>
        </div>
      </div>
   
    </div>
    </div>

    ))}
   
  </div>
  );
};

export default DoctorCard;
