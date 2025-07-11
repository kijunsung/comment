// src/context/AuthProvider.tsx

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';  
import { getToken, setToken, removeToken } from '../utils/token';

// User 타입에 role 필드 추가
export interface User {
  userId: number;
  username: string;
  role: 'USER' | 'ADMIN';
}

interface AuthProviderProps {
  children: ReactNode;
}

const USER_KEY = 'user';

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser]   = useState<User | null>(null);

  const login = (newToken: string, newUser: User) => {
    // 토큰 저장 (cookie/localStorage 등)
    setToken(newToken);
    setTokenState(newToken);

    // 사용자 정보 저장 (role 포함)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);

      // 사용자 정보 복원
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        } catch (err) {
          console.error('사용자 정보 복원 실패:', err);
          logout();
        }
      }
    }
  }, []);

  // AuthContextType 에 맞춰서 value 제공
  const contextValue: AuthContextType = {
    token,
    user,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
