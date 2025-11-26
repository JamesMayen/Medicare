import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  X
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(user?.availability || []);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

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

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, chatsRes] = await Promise.all([
        fetch('http://localhost:5000/api/appointments', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('http://localhost:5000/api/chats', {
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
      const res = await fetch('http://localhost:5000/api/auth/profile', {
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

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && user) {
      fetchUserDetails();
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
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
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${chat._id}/messages`, {
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
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ content: newMessage })
      });
      if (res.ok) {
        const updatedChat = await res.json();
        setChatMessages(updatedChat.messages);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessages = () => {

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Patient Messages</h2>
        <div className="flex h-96">
          <div className="w-1/3 border-r pr-4">
            <div className="space-y-2">
              {chats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className={`p-3 rounded cursor-pointer ${
                    selectedChat?._id === chat._id ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
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
          </div>
          <div className="w-2/3 pl-4 flex flex-col">
            {selectedChat ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
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
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAvailability = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const handleSave = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ availability })
        });

        if (res.ok) {
          setIsEditingAvailability(false);
          // Update user context
          const updatedUser = { ...user, availability };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    };

    const updateAvailability = (day, field, value) => {
      setAvailability(prev => prev.map(item =>
        item.day === day ? { ...item, [field]: value } : item
      ));
    };

    const toggleDay = (day) => {
      const existing = availability.find(item => item.day === day);
      if (existing) {
        setAvailability(prev => prev.filter(item => item.day !== day));
      } else {
        setAvailability(prev => [...prev, { day, startTime: '09:00', endTime: '17:00', isAvailable: true }]);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Availability Scheduler</h2>
          <button
            onClick={() => setIsEditingAvailability(!isEditingAvailability)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditingAvailability ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingAvailability ? (
          <div className="space-y-4">
            {days.map(day => {
              const dayAvailability = availability.find(item => item.day === day);
              return (
                <div key={day} className="flex items-center space-x-4 p-4 border rounded">
                  <input
                    type="checkbox"
                    checked={!!dayAvailability}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4"
                  />
                  <span className="w-20">{day}</span>
                  {dayAvailability && (
                    <>
                      <input
                        type="time"
                        value={dayAvailability.startTime}
                        onChange={(e) => updateAvailability(day, 'startTime', e.target.value)}
                        className="px-2 py-1 border rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={dayAvailability.endTime}
                        onChange={(e) => updateAvailability(day, 'endTime', e.target.value)}
                        className="px-2 py-1 border rounded"
                      />
                    </>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {availability.length > 0 ? availability.map(item => (
              <div key={item.day} className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{item.day}</span>
                <span>{item.startTime} - {item.endTime}</span>
              </div>
            )) : (
              <p className="text-gray-600">No availability set</p>
            )}
          </div>
        )}
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Fee</label>
          <p className="text-2xl font-bold text-green-600">${user.consultationFee || 0}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Update Fee
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Profile & Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p>{user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p>{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Specialization</label>
          <p>{user.specialization || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Experience</label>
          <p>{user.experience ? `${user.experience} years` : 'Not set'}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Edit Profile
        </button>
      </div>
    </div>
  );

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* User Icon Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <div className="relative">
              <button
                onClick={handleDropdownToggle}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
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
                              {userDetails?.consultationFee && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Fee:</span>
                                  <span>${userDetails.consultationFee}</span>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </div>
  );
};

export default DoctorDashboard;