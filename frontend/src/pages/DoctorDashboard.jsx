import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  MessageSquare,
  Clock,
  DollarSign,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Filter,
  User,
  ChevronDown,
  X,
  Briefcase,
  FileText
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, setUser, logout, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(user?.availability || []);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilitySuccess, setAvailabilitySuccess] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({ day: '', startTime: '', endTime: '' });
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fee, setFee] = useState(user?.consultationFees || 0);
  const [newFee, setNewFee] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFeeSuccessModal, setShowFeeSuccessModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    workLocation: user?.workLocation || '',
    hospital: user?.hospital || '',
    bio: user?.bio || '',
    phone: user?.contactDetails?.phone || '',
    address: user?.contactDetails?.address || '',
    profilePhoto: null
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'doctor') {
        navigate('/login');
        return;
      }
      fetchDashboardData();
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    setAvailability(user?.availability || []);
  }, [user?.availability]);

  useEffect(() => {
    setFee(user?.consultationFees || 0);
  }, [user?.consultationFees]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        specialization: user.specialization || '',
        experience: user.experience || '',
        workLocation: user.workLocation || '',
        hospital: user.hospital || '',
        bio: user.bio || '',
        phone: user.contactDetails?.phone || '',
        address: user.contactDetails?.address || '',
        profilePhoto: null
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'doctor') {
      loadAvailabilities();
    }
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
      } else {
        console.error('Failed to fetch user details:', res.status);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('specialization', profileForm.specialization);
    formData.append('experience', profileForm.experience);
    formData.append('workLocation', profileForm.workLocation);
    formData.append('hospital', profileForm.hospital);
    formData.append('bio', profileForm.bio);
    formData.append('phone', profileForm.phone);
    formData.append('address', profileForm.address);
    if (profileForm.profilePhoto) {
      formData.append('profilePhoto', profileForm.profilePhoto);
    }

    console.log('Frontend: Sending profile update - workLocation:', profileForm.workLocation, 'hospital:', profileForm.hospital);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Update local user state, preserving existing token
        const mergedUser = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        setUserDetails(updatedUser);
        setIsEditingProfile(false);
        setShowSuccessModal(true);
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

  const handleUpdateFee = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ consultationFees: Number(newFee) })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Update local user state, preserving existing token
        const mergedUser = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        setFee(Number(newFee));
        setNewFee('');
        setShowFeeSuccessModal(true);
      } else {
         try {
           const errorData = await res.json();
           alert(errorData.message || 'Failed to update fee');
         } catch {
           alert('Failed to update fee');
         }
       }
    } catch (error) {
      console.error('Error updating fee:', error);
      alert('Error updating fee');
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfileForm(prev => ({ ...prev, profilePhoto: e.target.files[0] }));
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && user) {
      fetchUserDetails();
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

  const loadAvailabilities = async () => {
    try {
      setAvailabilityLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/availability`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailabilitySlots(data.availabilities);
      } else {
        console.error('Failed to load availabilities');
      }
    } catch (error) {
      console.error('Error loading availabilities:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const addAvailability = async () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      alert('Please fill in all fields');
      return;
    }
    try {
      setAvailabilityLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(newSlot)
      });
      if (res.ok) {
        const data = await res.json();
        setAvailabilitySlots(prev => [...prev, data.availability]);
        setNewSlot({ day: '', startTime: '', endTime: '' });
        setAvailabilitySuccess('Availability slot added successfully');
        setTimeout(() => setAvailabilitySuccess(null), 3000);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add availability');
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Error adding availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const editAvailability = async (id, updatedSlot) => {
    try {
      setAvailabilityLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/doctor/availability/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedSlot)
      });
      if (res.ok) {
        const data = await res.json();
        setAvailabilitySlots(prev => prev.map(slot =>
          slot._id === id ? data.availability : slot
        ));
        setEditingSlot(null);
        setAvailabilitySuccess('Availability slot updated successfully');
        setTimeout(() => setAvailabilitySuccess(null), 3000);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Error updating availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const deleteAvailability = async (id) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;
    try {
      setAvailabilityLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/doctor/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setAvailabilitySlots(prev => prev.filter(slot => slot._id !== id));
        setAvailabilitySuccess('Availability slot deleted successfully');
        setTimeout(() => setAvailabilitySuccess(null), 3000);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to delete availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Error deleting availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'fee', label: 'Consultation Fee', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const renderOverview = () => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const todayAppointments = appointments.filter(app => app.date === today);
    const pendingAppointments = appointments.filter(app => app.status === 'pending');
    const confirmedAppointments = appointments.filter(app => app.status === 'confirmed');
    const completedAppointments = appointments.filter(app => app.status === 'completed');
    const uniquePatients = [...new Set(completedAppointments.map(app => app.patient._id))];

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
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{confirmedAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients Attended</p>
              <p className="text-2xl font-bold text-gray-900">{uniquePatients.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointments = () => {
    const [filter, setFilter] = useState('all');

    const filteredAppointments = appointments.filter(app => {
      if (filter === 'all') return true;
      return app.status === filter;
    });

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Appointment Management</h2>
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
          {filteredAppointments.map(appointment => (
            <div key={appointment._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{appointment.patient.name}</h3>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                  <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                </div>
                <div className="flex space-x-2">
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Mark Complete
                    </button>
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
            </div>
          ))}
        </div>
      </div>
    );
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

  const renderMessages = () => {

    return (
      <section className="bg-white rounded-lg shadow-md p-6" aria-labelledby="messages-heading">
        <h2 id="messages-heading" className="text-xl font-semibold mb-6">Patient Messages</h2>
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

  const renderAvailability = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Availability Management</h2>

        {availabilitySuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {availabilitySuccess}
          </div>
        )}

        {/* Add New Availability Form */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add New Availability Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addAvailability}
              disabled={availabilityLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availabilityLoading ? 'Adding...' : 'Add Availability'}
            </button>
          </div>
        </div>

        {/* Current Availability Slots */}
        <div>
          <h3 className="text-lg font-medium mb-4">Current Availability Slots</h3>
          {availabilityLoading && availabilitySlots.length === 0 ? (
            <div className="text-center py-4">Loading...</div>
          ) : availabilitySlots.length > 0 ? (
            <div className="space-y-3">
              {availabilitySlots.map(slot => (
                <div key={slot._id} className="flex items-center justify-between p-4 border rounded-lg">
                  {editingSlot === slot._id ? (
                    <div className="flex items-center space-x-4 flex-1">
                      <select
                        value={slot.day}
                        onChange={(e) => setAvailabilitySlots(prev => prev.map(s =>
                          s._id === slot._id ? { ...s, day: e.target.value } : s
                        ))}
                        className="px-2 py-1 border rounded"
                      >
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => setAvailabilitySlots(prev => prev.map(s =>
                          s._id === slot._id ? { ...s, startTime: e.target.value } : s
                        ))}
                        className="px-2 py-1 border rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => setAvailabilitySlots(prev => prev.map(s =>
                          s._id === slot._id ? { ...s, endTime: e.target.value } : s
                        ))}
                        className="px-2 py-1 border rounded"
                      />
                      <button
                        onClick={() => editAvailability(slot._id, {
                          day: slot.day,
                          startTime: slot.startTime,
                          endTime: slot.endTime
                        })}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSlot(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium">{slot.day}</span>
                        <span className="ml-4 text-gray-600">{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSlot(slot._id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAvailability(slot._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No availability slots added yet</p>
          )}
        </div>
      </div>
    );
  };

  const renderPatients = () => {
    const completedAppointments = appointments.filter(app => app.status === 'completed');
    const patientsMap = {};

    completedAppointments.forEach(app => {
      if (!patientsMap[app.patient._id]) {
        patientsMap[app.patient._id] = {
          patient: app.patient,
          appointments: []
        };
      }
      patientsMap[app.patient._id].appointments.push(app);
    });

    const patients = Object.values(patientsMap);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Patient Medical Info</h2>
        <div className="space-y-6">
          {patients.map(({ patient, appointments }) => (
            <div key={patient._id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{patient.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{patient.email}</p>
              <h4 className="font-medium mb-2">Past Appointments:</h4>
              <div className="space-y-2">
                {appointments.map(app => (
                  <div key={app._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{app.date} at {app.time}</span>
                      <span className="text-sm text-gray-600">{app.reason}</span>
                    </div>
                    {app.notes && (
                      <p className="text-sm text-gray-700 mt-1">Notes: {app.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {patients.length === 0 && (
            <p className="text-gray-600">No completed appointments yet.</p>
          )}
        </div>
      </div>
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
        <h2 className="text-xl font-semibold mb-6">Notifications Center</h2>
        <div className="space-y-4">
          {pendingAppointments.length > 0 && (
            <div className="border-l-4 border-yellow-400 pl-4">
              <h3 className="font-medium text-yellow-800">New Appointment Requests</h3>
              <p className="text-sm text-yellow-700">
                You have {pendingAppointments.length} pending appointment request(s) to review.
              </p>
            </div>
          )}
          {recentCompleted.length > 0 && (
            <div className="border-l-4 border-green-400 pl-4">
              <h3 className="font-medium text-green-800">Recent Completions</h3>
              <ul className="text-sm text-green-700 space-y-1">
                {recentCompleted.map(app => (
                  <li key={app._id}>
                    Appointment with {app.patient.name} on {app.date}
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

  const renderAnalytics = () => {
    const completedAppointments = appointments.filter(app => app.status === 'completed');
    const thisWeek = completedAppointments.filter(app => {
      const appDate = new Date(app.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return appDate >= weekAgo;
    });

    const thisMonth = completedAppointments.filter(app => {
      const appDate = new Date(app.date);
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return appDate >= monthAgo;
    });

    const dayStats = {};
    completedAppointments.forEach(app => {
      const day = new Date(app.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayStats[day] = (dayStats[day] || 0) + 1;
    });

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Analytics & Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">This Week</h3>
            <p className="text-2xl font-bold text-blue-600">{thisWeek.length}</p>
            <p className="text-sm text-blue-700">Appointments completed</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">This Month</h3>
            <p className="text-2xl font-bold text-green-600">{thisMonth.length}</p>
            <p className="text-sm text-green-700">Appointments completed</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Appointments by Day</h3>
          <div className="space-y-2">
            {Object.entries(dayStats).map(([day, count]) => (
              <div key={day} className="flex justify-between">
                <span>{day}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFee = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Consultation Fee Management</h2>
      <div className="space-y-6">
        {/* Current Fee Display Box */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Current Consultation Fee</h3>
          <p className="text-3xl font-bold text-green-600">${fee}</p>
        </div>

        {/* Update Fee Box */}
        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Update Consultation Fee</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Fee ($)</label>
              <input
                type="number"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                placeholder="Enter new consultation fee"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={handleUpdateFee}
              disabled={!newFee || Number(newFee) <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Fee
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Profile & Settings</h2>
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
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
            <label className="block text-sm font-medium text-gray-700">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={profileForm.specialization}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
            <input
              type="number"
              name="experience"
              value={profileForm.experience}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Location</label>
            <input
              type="text"
              name="workLocation"
              value={profileForm.workLocation}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hospital</label>
            <input
              type="text"
              name="hospital"
              value={profileForm.hospital}
              onChange={handleProfileFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileFormChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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
                {user.specialization && <p className="text-blue-200 mt-1">{user.specialization}</p>}
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
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Professional Details
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Specialization</label>
                  <p className="text-gray-900 font-medium">{user.specialization || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Experience</label>
                  <p className="text-gray-900">{user.experience ? `${user.experience} years` : 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Hospital</label>
                  <p className="text-gray-900">{user.hospital || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Work Location</label>
                  <p className="text-gray-900">{user.workLocation || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio and Address Section */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Additional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
                <p className="text-gray-900 leading-relaxed">{user.bio || 'No bio available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
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
                  <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="relative p-4">
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-sm"
                        aria-label="Close user details"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="pr-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Doctor Details</h3>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                            <p className="text-base font-semibold text-gray-900">{userDetails?.name || user?.name || 'Doctor'}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-sm text-gray-700 break-words">{userDetails?.email || user?.email || 'email@example.com'}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                            <p className="text-sm font-medium text-blue-600 capitalize bg-blue-50 px-2 py-1 rounded-md inline-block">
                              {userDetails?.role || user?.role || 'doctor'}
                            </p>
                          </div>

                          <div className="border-t pt-3 mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Doctor Information</h4>
                            <div className="space-y-2 text-xs text-gray-600">
                              {userDetails?.specialization && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Specialization:</span>
                                  <span>{userDetails.specialization}</span>
                                </div>
                              )}
                              {userDetails?.experience && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Experience:</span>
                                  <span>{userDetails.experience} years</span>
                                </div>
                              )}
                              {userDetails?.workLocation && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Location:</span>
                                  <span>{userDetails.workLocation}</span>
                                </div>
                              )}
                              {userDetails?.consultationFees && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Fee:</span>
                                  <span>${userDetails.consultationFees}</span>
                                </div>
                              )}
                              {userDetails?.hospital && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Hospital:</span>
                                  <span>{userDetails.hospital}</span>
                                </div>
                              )}
                            </div>
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
            <div className="bg-white rounded-lg shadow-md p-6">
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
            </div>
          </div>

          <div className="lg:w-3/4">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'availability' && renderAvailability()}
            {activeTab === 'patients' && renderPatients()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'fee' && renderFee()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Success</h3>
            <p className="mb-4">Profile updated successfully</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Fee Success Modal */}
      {showFeeSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Success</h3>
            <p className="mb-4">Fees updated successfully</p>
            <button
              onClick={() => setShowFeeSuccessModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;