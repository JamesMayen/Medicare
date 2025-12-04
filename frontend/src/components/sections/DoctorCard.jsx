import React, { useState, useEffect } from "react";
import { Star, MapPin, Calendar, Clock, MessageCircle, Phone, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppointmentBookingModal from "../AppointmentBookingModal";
// import DoctorsPage from "./DoctorPage";

// ✅ DoctorCard component

const DoctorCard = ({ doctors = [], loading = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const isAvailableToday = (availabilities) => {
    if (!availabilities || availabilities.length === 0) return false;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return availabilities.some(avail => avail.day === today);
  };

  const handleBookAppointment = (doctor) => {
    if (!user) {
      // Not logged in, redirect to login
      navigate('/login');
      return;
    }

    if (user.role === 'doctor') {
      // Doctors cannot book appointments
      alert('Doctors cannot book appointments. Please login as a patient.');
      return;
    }

    // User is logged in as patient, open booking modal
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading doctors...</div>;
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center" role="list" aria-label="Available doctors">
    {doctors.map((doctor) => (
      <article key={doctor._id} className="" role="listitem">

    <div className="relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
      {/* ===== Doctor Image ===== */}
      <div className="relative flex flex-col gap-4 p-2">
        <img
          src={doctor.profilePhoto || 'https://via.placeholder.com/150'}
          alt={`Profile photo of Dr. ${doctor.name}, ${doctor.specialization}`}
          className="w-sm h-sm object-cover group-hover:scale-105 transition-transform duration-300"/>
        {doctor.isVerified && (
          <span
            className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow"
            aria-label="Doctor is verified"
          >
            Verified
          </span>
        )}
        {isAvailableToday(doctor.availabilities) && (
          <span
            className="absolute top-4 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow"
            aria-label="Doctor is available today"
          >
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
          <p className="text-sm text-gray-500">{doctor.specialization || 'Specialist'}</p>
        </div>

        {/* ===== Rating & Experience ===== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
            <span className="font-medium text-gray-800">{doctor.averageRating?.toFixed(1) || 'N/A'}</span>
            <span className="text-gray-500 text-sm">
              (rating)
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {doctor.experience || 0} yrs exp.
          </div>
        </div>

        {/* ===== Location ===== */}
        <div className="flex items-start space-x-2 text-gray-500">
          <MapPin className="w-4 h-4 mt-0.5" aria-hidden="true" />
          <div>
            <div className="font-medium text-gray-800">
              {doctor.hospital || 'Hospital'}
            </div>
            <div className="text-sm">{doctor.workLocation || 'Location'}</div>
          </div>
        </div>

        {/* ===== Consultation Fee ===== */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Consultation</span>
          </div>
          <span className="text-lg font-semibold text-blue-600">
            ${doctor.consultationFees || 0}
          </span>
        </div>

        {/* ===== Availability ===== */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-500 mb-2">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Available</span>
          </div>
          <div className="text-sm text-gray-800">
            {doctor.availabilities && doctor.availabilities.length > 0 ? (
              <ul className="space-y-1">
                {doctor.availabilities.map((avail, index) => (
                  <li key={index}>
                    {avail.day} {avail.startTime} - {avail.endTime}
                  </li>
                ))}
              </ul>
            ) : (
              'Not set'
            )}
          </div>
        </div>

        {/* ===== Bio ===== */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-700">{doctor.bio || 'No bio available.'}</p>
        </div>

        {/* ===== Contact Details ===== */}
        <div className="pt-3 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-500">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{doctor.contactDetails?.phone || 'Phone not available'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Home className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{doctor.contactDetails?.address || 'Address not available'}</span>
            </div>
          </div>
        </div>

        {/* ===== Action Buttons ===== */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => handleBookAppointment(doctor)}
            className="flex-1 flex items-center justify-center cursor-pointer bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Book appointment with Dr. ${doctor.name}, ${doctor.specialization}`}
          >
            <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
            Book Appointment
          </button>
          <button
            className="p-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Send message to Dr. ${doctor.name}`}
          >
            <MessageCircle className="w-4 cursor-pointer h-4 text-blue-600" aria-hidden="true" />
          </button>
        </div>
      </div>

    </div>
    </article>

    ))}

    <AppointmentBookingModal
      doctor={selectedDoctor}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </div>
  );
};

export default DoctorCard;
