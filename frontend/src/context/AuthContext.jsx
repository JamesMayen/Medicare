import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Load backend URL from .env
const API_URL = import.meta.env.VITE_API_URL;   // <--- IMPORTANT

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);
        if (!decoded.name || !decoded.email) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser({ ...JSON.parse(storedUser), token: storedToken });
        }
      } catch (err) {
        console.error('Invalid token or user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const { token, ...userData } = data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser({ ...userData, token });

        // Fetch full profile
        try {
          const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${data.token}` }
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            localStorage.setItem('user', JSON.stringify(profileData));
            setUser({ ...profileData, token: data.token });
          }
        } catch (profileErr) {
          console.error('Error fetching profile after login:', profileErr);
        }

        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (fullName, email, password, role = 'patient') => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const { token, ...userData } = data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser({ ...userData, token });

        // Fetch profile
        try {
          const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${data.token}` }
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            localStorage.setItem('user', JSON.stringify(profileData));
            setUser({ ...profileData, token: data.token });
          }
        } catch (profileErr) {
          console.error('Error fetching profile after register:', profileErr);
        }

        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
