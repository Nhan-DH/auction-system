import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auction';
import { socketService } from '../services/socket';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  login: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    username: string;
    password?: string;
    displayName: string;
    email?: string;
    avatar?: string;
    initialBalance?: number;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  depositBalance: (amount: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsersList(data.users);
        // If no current user, restore from localStorage or pick default
        const savedUserId = localStorage.getItem('auction_user_id');
        if (savedUserId) {
          const found = data.users.find((u: User) => u.id === savedUserId);
          if (found) {
            setCurrentUser(found);
            socketService.connect(found.id);
            return;
          }
        }
        // If no saved user, keep currentUser null so login/register screen is shown!
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Listen to user balance update from socket
    const unsub = socketService.on('user:balance_update', (payload) => {
      if (payload?.balance !== undefined) {
        setCurrentUser((prev) => (prev ? { ...prev, balance: payload.balance } : null));
        setUsersList((prev) =>
          prev.map((u) => (u.id === currentUser?.id ? { ...u, balance: payload.balance } : u))
        );
      }
    });

    return () => {
      unsub();
    };
  }, [currentUser?.id]);

  const login = async (
    username: string,
    password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('auction_user_id', data.user.id);
        socketService.connect(data.user.id);
        return { success: true };
      }
      return { success: false, message: data.message || 'Đăng nhập không thành công!' };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, message: 'Lỗi kết nối máy chủ!' };
    }
  };

  const register = async (userData: {
    username: string;
    password?: string;
    displayName: string;
    email?: string;
    avatar?: string;
    initialBalance?: number;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('auction_user_id', data.user.id);
        socketService.connect(data.user.id);
        await fetchUsers();
        return { success: true };
      }
      return { success: false, message: data.message || 'Đăng ký không thành công!' };
    } catch (e: any) {
      console.error('Register error:', e);
      return { success: false, message: 'Lỗi kết nối máy chủ!' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auction_user_id');
  };

  const switchUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('auction_user_id', target.id);
      socketService.connect(target.id);
    }
  };

  const depositBalance = async (amount: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setUsersList((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      }
    } catch (e) {
      console.error('Deposit error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        login,
        register,
        logout,
        switchUser,
        depositBalance,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
