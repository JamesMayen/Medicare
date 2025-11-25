import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (!decoded.name || !decoded.email) {
          // Old token without user details, remove it
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({ ...decoded, token: storedToken });
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('https://medicare-system-5027.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setUser({ ...decoded, token: data.token });
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
      const res = await fetch('https://medicare-system-5027.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setUser({ ...decoded, token: data.token });
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
