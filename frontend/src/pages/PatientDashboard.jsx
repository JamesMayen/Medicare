import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/UI/card';
import { Button } from '../components/UI/button';
import AppointmentBookingModal from '../components/AppointmentBookingModal';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  LogOut,
  ChevronDown,
  X,
  Star,
  BarChart3,
  Plus,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Stethoscope,
  Cross
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, setUser, logout, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [messages, setMessages] = useState({});
  const [ratedAppointments, setRatedAppointments] = useState(new Set());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.contactDetails?.phone || '',
    address: user?.contactDetails?.address || '',
    medicalInfo: user?.medicalInfo || '',
    insurance: user?.insurance || '',
    profilePhoto: null
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'patient') {
        navigate('/login');
        return;
      }
      fetchDashboardData();
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.contactDetails?.phone || '',
      address: user?.contactDetails?.address || '',
      medicalInfo: user?.medicalInfo || '',
      insurance: user?.insurance || '',
      profilePhoto: null
    });
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const { chatId, message } = data;
      if (selectedChat && selectedChat._id === chatId) {
        setChatMessages(prev => [...prev, message]);
      }
      // Update chats list
      setChats(prev => prev.map(chat =>
        chat._id === chatId ? { ...chat, lastMessage: new Date(), messages: [...chat.messages, message] } : chat
      ));
    };

    const handleChatUpdated = (data) => {
      setChats(prev => prev.map(chat =>
        chat._id === data.chat._id ? { ...chat, ...data.chat } : chat
      ));
    };

    const handleAppointmentUpdated = (appointment) => {
      setAppointments(prev => prev.map(app =>
        app._id === appointment._id ? appointment : app
      ));
    };

    const handleAppointmentCreated = (appointment) => {
      setAppointments(prev => [appointment, ...prev]);
    };

    const handleDashboardUpdate = () => {
      fetchDashboardData();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('chat_updated', handleChatUpdated);
    socket.on('appointment_updated', handleAppointmentUpdated);
    socket.on('appointment_created', handleAppointmentCreated);
    socket.on('dashboard_update', handleDashboardUpdate);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('appointment_updated', handleAppointmentUpdated);
      socket.off('appointment_created', handleAppointmentCreated);
      socket.off('dashboard_update', handleDashboardUpdate);
    };
  }, [socket, selectedChat]);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, chatsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }

      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats(chatsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
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

  const submitRating = async (appointmentId, doctorId) => {
    const rating = selectedRatings[appointmentId];
    const review = reviews[appointmentId];
    if (!rating) {
      setMessages(prev => ({ ...prev, [appointmentId]: 'Please select a rating' }));
      return;
    }
    setSubmitting(prev => ({ ...prev, [appointmentId]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ doctor: doctorId, rating, review })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => ({ ...prev, [appointmentId]: 'Rating submitted successfully' }));
        setRatedAppointments(prev => new Set([...prev, appointmentId]));
      } else {
        setMessages(prev => ({ ...prev, [appointmentId]: data.message || 'Error submitting rating' }));
      }
    } catch (error) {
      setMessages(prev => ({ ...prev, [appointmentId]: 'Network error' }));
    } finally {
      setSubmitting(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('phone', profileForm.phone);
    formData.append('address', profileForm.address);
    formData.append('medicalInfo', profileForm.medicalInfo);
    formData.append('insurance', profileForm.insurance);
    if (profileForm.profilePhoto) {
      formData.append('profilePhoto', profileForm.profilePhoto);
    }

    console.log('Frontend: Sending FormData with fields:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Clean up preview URL after successful upload
        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
          setPhotoPreview(null);
        }
        // Update local user state, preserving existing token
        const mergedUser = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        setUserDetails(updatedUser);
        setIsEditingProfile(false);
        setIsSuccessModalOpen(true);
      } else {
        try {
          const errorData = await res.json();
          alert(errorData.message || 'Failed to update profile');
        } catch {
          alert('Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous preview URL if it exists
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      // Create new preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setProfileForm(prev => ({ ...prev, profilePhoto: file }));
    }
  };

  const openChat = async (chat) => {
    setSelectedChat(chat);
    if (socket) {
      socket.emit('join_chat', chat._id);
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chats/${chat._id}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const msgs = await res.json();
        setChatMessages(msgs);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;
    try {
      socket.emit('send_message', { chatId: selectedChat._id, content: newMessage });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'book', label: 'Book Appointment', icon: Plus },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'doctors', label: 'My Doctors', icon: Stethoscope },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const todayAppointments = appointments.filter(app => app.date === today);
    const upcomingAppointments = appointments.filter(app =>
      app.status === 'confirmed' && new Date(app.date) >= new Date()
    );
    const pendingAppointments = appointments.filter(app => app.status === 'pending');
    const completedAppointments = appointments.filter(app => app.status === 'completed');
    const uniqueDoctors = [...new Set(completedAppointments.map(app => app.doctor._id))];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doctors Visited</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueDoctors.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookAppointment = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Book New Appointment</h2>
      <div className="text-center py-12">
        <Plus className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Your Next Visit</h3>
        <p className="text-gray-600 mb-6">Find and book appointments with healthcare professionals</p>
        <Button
          onClick={() => setIsBookingModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );

  const renderAppointments = () => {
    const [filter, setFilter] = useState('all');

    const filteredAppointments = appointments.filter(app => {
      if (filter === 'all') return true;
      return app.status === filter;
    });

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Appointments</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <div key={appointment._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{appointment.doctor.name}</h3>
                    <p className="text-sm text-gray-600">{appointment.reason}</p>
                    <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                    <p className="text-sm text-gray-600">Type: {appointment.type}</p>
                    <p className="text-sm text-gray-600">Specialization: {appointment.doctor.specialization}</p>
                  </div>
                  <div className="flex space-x-2">
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <>
                        <Button
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </div>
                {appointment.status === 'completed' && !ratedAppointments.has(appointment._id) && (
                  <div className="mt-4 p-4 border rounded">
                    <h4 className="font-semibold mb-2">Rate this appointment</h4>
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={`w-6 h-6 cursor-pointer ${selectedRatings[appointment._id] >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          onClick={() => setSelectedRatings(prev => ({ ...prev, [appointment._id]: i }))}
                        />
                      ))}
                    </div>
                    <textarea
                      placeholder="Optional review"
                      value={reviews[appointment._id] || ''}
                      onChange={(e) => setReviews(prev => ({ ...prev, [appointment._id]: e.target.value }))}
                      className="w-full p-2 border rounded mb-2"
                    />
                    <Button
                      onClick={() => submitRating(appointment._id, appointment.doctor._id)}
                      disabled={submitting[appointment._id]}
                    >
                      {submitting[appointment._id] ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                    {messages[appointment._id] && <p className="mt-2 text-sm text-red-600">{messages[appointment._id]}</p>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No {filter === 'all' ? '' : filter} appointments.</p>
          )}
        </div>
      </div>
    );
  };

  const renderDoctors = () => {
    const completedAppointments = appointments.filter(app => app.status === 'completed');
    const doctorsMap = {};

    completedAppointments.forEach(app => {
      if (!doctorsMap[app.doctor._id]) {
        doctorsMap[app.doctor._id] = {
          doctor: app.doctor,
          appointments: []
        };
      }
      doctorsMap[app.doctor._id].appointments.push(app);
    });

    const doctors = Object.values(doctorsMap);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">My Doctors</h2>
        <div className="space-y-6">
          {doctors.map(({ doctor, appointments }) => (
            <div key={doctor._id} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-4">
                {doctor.profilePhoto ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/api/uploads/${doctor.profilePhoto.replace(/^\/uploads\//, '')}`}
                    alt={doctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  <p className="text-sm text-gray-600">{doctor.hospital}</p>
                </div>
              </div>
              <h4 className="font-medium mb-2">Past Appointments ({appointments.length})</h4>
              <div className="space-y-2">
                {appointments.slice(0, 3).map(app => (
                  <div key={app._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{app.date} at {app.time}</span>
                      <span className="text-sm text-gray-600">{app.reason}</span>
                    </div>
                  </div>
                ))}
                {appointments.length > 3 && (
                  <p className="text-sm text-gray-600">And {appointments.length - 3} more...</p>
                )}
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <p className="text-gray-600">No doctors visited yet.</p>
          )}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <section className="bg-white rounded-lg shadow-md p-6" aria-labelledby="messages-heading">
        <h2 id="messages-heading" className="text-xl font-semibold mb-6">Messages</h2>
        <div className="flex h-96">
          <aside className="w-1/3 border-r pr-4" aria-label="Chat list">
            <div className="space-y-2" role="listbox" aria-label="Available chats">
              {chats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className={`p-3 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedChat?._id === chat._id ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={selectedChat?._id === chat._id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openChat(chat);
                    }
                  }}
                >
                  <h3 className="font-semibold text-sm">
                    {chat.participants.find(p => p._id !== user._id)?.name}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {chat.messages[chat.messages.length - 1]?.content || 'No messages'}
                  </p>
                </div>
              ))}
            </div>
          </aside>
          <main className="w-2/3 pl-4 flex flex-col" aria-label="Chat conversation">
            {selectedChat ? (
              <>
                <div
                  className="flex-1 overflow-y-auto space-y-2 mb-4"
                  role="log"
                  aria-label="Chat messages"
                  aria-live="polite"
                  aria-atomic="false"
                >
                  {chatMessages.map(msg => (
                    <div
                      key={msg._id}
                      className={`p-2 rounded ${
                        msg.sender === user._id
                          ? 'bg-blue-100 ml-auto max-w-xs'
                          : 'bg-gray-100 max-w-xs'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <label htmlFor="message-input" className="sr-only">Type your message</label>
                  <input
                    id="message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500" role="status">
                Select a conversation to start messaging
              </div>
            )}
          </main>
        </div>
      </section>
    );
  };

  const renderNotifications = () => {
    const pendingAppointments = appointments.filter(app => app.status === 'pending');
    const recentCompleted = appointments
      .filter(app => app.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Notifications</h2>
        <div className="space-y-4">
          {pendingAppointments.length > 0 && (
            <div className="border-l-4 border-yellow-400 pl-4">
              <h3 className="font-medium text-yellow-800">Appointment Updates</h3>
              <p className="text-sm text-yellow-700">
                You have {pendingAppointments.length} pending appointment(s) awaiting confirmation.
              </p>
            </div>
          )}
          {recentCompleted.length > 0 && (
            <div className="border-l-4 border-green-400 pl-4">
              <h3 className="font-medium text-green-800">Recent Completions</h3>
              <ul className="text-sm text-green-700 space-y-1">
                {recentCompleted.map(app => (
                  <li key={app._id}>
                    Appointment with {app.doctor.name} completed on {app.date}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {pendingAppointments.length === 0 && recentCompleted.length === 0 && (
            <p className="text-gray-600">No new notifications.</p>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Settings</h2>
        <button
          onClick={() => {
            if (isEditingProfile && photoPreview) {
              // Clean up preview URL when canceling edit
              URL.revokeObjectURL(photoPreview);
              setPhotoPreview(null);
            }
            setIsEditingProfile(!isEditingProfile);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditingProfile ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      {isEditingProfile ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={profileForm.address}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Medical Information</label>
            <textarea
              name="medicalInfo"
              value={profileForm.medicalInfo}
              onChange={handleProfileFormChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance</label>
            <input
              type="text"
              name="insurance"
              value={profileForm.insurance}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            {/* Preview Section */}
            <div className="mb-4 flex justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
              ) : user?.profilePhoto ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/api/uploads/${user.profilePhoto.replace(/^\/uploads\//, '')}`}
                  alt="Current profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-md">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              {photoPreview ? 'New photo selected - click "Save Changes" to upload' : 'Select a new profile photo'}
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
            <div className="flex items-center space-x-6">
              {user?.profilePhoto ? (
                (() => {
                  const cleanPath = user.profilePhoto.replace(/^\/uploads\//, '');
                  const imageSrc = `${import.meta.env.VITE_API_URL}/api/uploads/${cleanPath}`;
                  console.log('Profile image src:', imageSrc);
                  return (
                    <img
                      src={imageSrc}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => console.error('Image load error:', e)}
                    />
                  );
                })()
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-md">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-3xl font-bold">{user.name}</h3>
                <p className="text-blue-100 text-lg">{user.email}</p>
                <p className="text-blue-200 mt-1">Patient</p>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900 font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email Address</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-gray-900">{user.contactDetails?.phone || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Cross className="w-5 h-5 mr-2 text-blue-600" />
                Medical Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Medical Info</label>
                  <p className="text-gray-900">{user.medicalInfo || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Insurance</label>
                  <p className="text-gray-900">{user.insurance || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Account Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-900 font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-gray-900">
                  {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                    ? new Date(user.createdAt).toLocaleString()
                    : 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">{user.contactDetails?.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* User Icon Header */}
      <header className="bg-white shadow-md" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <div className="relative">
              <button
                onClick={handleDropdownToggle}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {user?.profilePhoto ? (
                  (() => {
                    const cleanPath = user.profilePhoto.replace(/^\/uploads\//, '');
                    const imageSrc = `${import.meta.env.VITE_API_URL}/api/uploads/${cleanPath}`;
                    console.log('Header profile image src:', imageSrc);
                    return (
                      <img
                        src={imageSrc}
                        alt="Profile"
                        className="w-5 h-5 rounded-full object-cover"
                        aria-hidden="true"
                        onError={(e) => console.error('Header image load error:', e)}
                      />
                    );
                  })()
                ) : (
                  <User className="w-5 h-5" aria-hidden="true" />
                )}
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </button>
              {isDropdownOpen && (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    <div className="relative p-4">
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-sm"
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
                              {userDetails?.role || user?.role || 'patient'}
                            </p>
                          </div>

                          <div className="border-t pt-3 mt-3">
                            <button
                              onClick={() => {
                                handleLogout();
                                setIsDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <Card className="p-6">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="lg:w-3/4">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'book' && renderBookAppointment()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'doctors' && renderDoctors()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </main>

      {isBookingModalOpen && (
        <AppointmentBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onAppointmentBooked={() => {
            setIsBookingModalOpen(false);
            fetchDashboardData();
          }}
        />
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Profile Updated Successfully</h2>
            </div>
            <div className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="mb-4">Your profile has been updated successfully!</p>
              <Button onClick={() => { setIsSuccessModalOpen(false); setActiveTab('overview'); }}>Ok</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;