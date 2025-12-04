import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from './UI/card';
import { Button } from './UI/button';

const AppointmentBookingModal = ({ doctor, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: form, 2: preview, 3: success
  const [formData, setFormData] = useState({
    date: null,
    timeSlot: '',
    appointmentType: 'In-Person',
    reason: '',
    documents: []
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullDoctor, setFullDoctor] = useState(doctor);

  useEffect(() => {
    if (formData.date && doctor?.id) {
      fetchSlots();
    }
  }, [formData.date, doctor?.id]);

  useEffect(() => {
    if (doctor && doctor.id && (!doctor.averageRating || !doctor.experience)) {
      fetchDoctorDetails();
    } else {
      setFullDoctor(doctor);
    }
  }, [doctor]);

  if (!isOpen || !doctor) return null;

  const fetchSlots = async () => {
    const dateStr = formData.date.toISOString().split('T')[0];
    try {
      const response = await fetch(`/api/appointments/available-slots/${doctor.id}/${dateStr}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(`/api/auth/doctors/${doctor.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setFullDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setFullDoctor(doctor); // fallback
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push('★');
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push('☆'); // half star, but using empty for simplicity
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? Array.from(files) : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date, timeSlot: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('doctorId', doctor.id);
    formDataToSend.append('date', formData.date.toISOString().split('T')[0]);
    formDataToSend.append('timeSlot', formData.timeSlot);
    formDataToSend.append('appointmentType', formData.appointmentType);
    formDataToSend.append('reason', formData.reason);
    formData.documents.forEach(file => formDataToSend.append('documents', file));

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formDataToSend
      });
      if (response.ok) {
        setStep(3);
      } else {
        alert('Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleViewAppointment = () => {
    // Assume navigate to appointments page
    navigate('/appointments');
    onClose();
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Book Appointment</h2>
              <p className="text-gray-600">Booking appointment with Dr. {fullDoctor?.name}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Doctor Summary */}
              <Card className="p-4">
                <div className="flex items-center space-x-4">
                  <img src={fullDoctor?.image || fullDoctor?.profilePhoto} alt={fullDoctor?.name} className="w-16 h-16 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{fullDoctor?.name}</h3>
                    <p className="text-gray-600">{fullDoctor?.specialty || fullDoctor?.specialization}</p>
                    {fullDoctor?.averageRating && (
                      <p className="text-sm text-gray-500">Rating: {renderStars(fullDoctor.averageRating)} ({fullDoctor.averageRating})</p>
                    )}
                    {fullDoctor?.experience && (
                      <p className="text-sm text-gray-500">Experience: {fullDoctor.experience} years</p>
                    )}
                    <p className="text-sm text-gray-500">Location: {fullDoctor?.workLocation || `${fullDoctor?.hospital} - ${fullDoctor?.location}`}</p>
                    <p className="text-sm text-gray-500">Consultation Fee: ${fullDoctor?.consultationFees}</p>
                  </div>
                </div>
              </Card>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="w-full p-2 border rounded"
                    placeholderText="Select date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Slot</label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select time</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Appointment Type</label>
                  <select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Documents (optional)</label>
                  <input
                    type="file"
                    name="documents"
                    onChange={handleInputChange}
                    multiple
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="button" onClick={handleConfirm}>Preview</Button>
                </div>
              </form>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Preview & Confirm</h2>
            </div>
            <div className="p-6 space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Appointment Summary</h3>
                <p><strong>Doctor:</strong> Dr. {fullDoctor?.name}</p>
                <p><strong>Date:</strong> {formData.date?.toDateString()}</p>
                <p><strong>Time:</strong> {formData.timeSlot}</p>
                <p><strong>Type:</strong> {formData.appointmentType}</p>
                <p><strong>Reason:</strong> {formData.reason}</p>
                {fullDoctor?.consultationFees && <p><strong>Fee:</strong> ${fullDoctor.consultationFees}</p>}
              </Card>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Appointment Booked Successfully</h2>
            </div>
            <div className="p-6 text-center">
              <p className="mb-4">Your appointment has been booked successfully!</p>
              <div className="flex justify-center space-x-2">
                <Button onClick={handleViewAppointment}>View Appointment</Button>
                <Button variant="outline" onClick={handleBackToDashboard}>Back to Dashboard</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentBookingModal;