import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem('voize_user') || null);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password });
    localStorage.setItem('voize_access', data.access);
    localStorage.setItem('voize_refresh', data.refresh);
    localStorage.setItem('voize_user', username);
    setUser(username);
  };

  const register = async (username, email, password) => {
    await api.post('/auth/register/', { username, email, password });
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('voize_access');
    localStorage.removeItem('voize_refresh');
    localStorage.removeItem('voize_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);