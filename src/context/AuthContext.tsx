import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, StudySlot, WeeklyTarget, MonthlyTarget, TaskLog, NotificationLog } from '../types';
import {
  getStoredUsers, saveStoredUsers,
  getStoredSlots, saveStoredSlots,
  getStoredWeeklyTargets, saveStoredWeeklyTargets,
  getStoredMonthlyTargets, saveStoredMonthlyTargets,
  getStoredTasks, saveStoredTasks,
  getStoredNotifications, saveStoredNotifications
} from '../utils/storage';

export type AppRoute = 'student' | 'faculty' | 'admin' | 'login_student' | 'login_faculty' | 'login_admin' | 'blueprint';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  login: (email: string, password: string, targetRole: Role) => Promise<{ success: boolean; error?: string }>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    targetRole: Role,
    batch?: string,
    targetExam?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  users: User[];
  updateUsers: (newUsers: User[]) => void;
  slots: StudySlot[];
  updateSlots: (newSlots: StudySlot[]) => void;
  weeklyTargets: WeeklyTarget[];
  updateWeeklyTargets: (newTargets: WeeklyTarget[]) => void;
  monthlyTargets: MonthlyTarget[];
  updateMonthlyTargets: (newTargets: MonthlyTarget[]) => void;
  tasks: TaskLog[];
  updateTasks: (newTasks: TaskLog[]) => void;
  notifications: NotificationLog[];
  addNotification: (notif: Omit<NotificationLog, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsersState] = useState<User[]>(getStoredUsers);
  const [slots, setSlotsState] = useState<StudySlot[]>(getStoredSlots);
  const [weeklyTargets, setWeeklyTargetsState] = useState<WeeklyTarget[]>(getStoredWeeklyTargets);
  const [monthlyTargets, setMonthlyTargetsState] = useState<MonthlyTarget[]>(getStoredMonthlyTargets);
  const [tasks, setTasksState] = useState<TaskLog[]>(getStoredTasks);
  const [notifications, setNotificationsState] = useState<NotificationLog[]>(getStoredNotifications);

  // Restore session from localStorage if user was previously logged in
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem('mcd_active_user_id');
      if (savedId) {
        const list = getStoredUsers();
        return list.find(u => u.id === savedId) || null;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (currentUser) return currentUser.role;
    return 'login_student';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const updateUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    saveStoredUsers(newUsers);
    if (currentUser) {
      const updatedCurrent = newUsers.find(u => u.id === currentUser.id);
      if (updatedCurrent) setCurrentUser(updatedCurrent);
    }
  };

  const updateSlots = (newSlots: StudySlot[]) => {
    setSlotsState(newSlots);
    saveStoredSlots(newSlots);
  };

  const updateWeeklyTargets = (newTargets: WeeklyTarget[]) => {
    setWeeklyTargetsState(newTargets);
    saveStoredWeeklyTargets(newTargets);
  };

  const updateMonthlyTargets = (newTargets: MonthlyTarget[]) => {
    setMonthlyTargetsState(newTargets);
    saveStoredMonthlyTargets(newTargets);
  };

  const updateTasks = (newTasks: TaskLog[]) => {
    setTasksState(newTasks);
    saveStoredTasks(newTasks);
  };

  const addNotification = (notif: Omit<NotificationLog, 'id' | 'timestamp' | 'read'>) => {
    const newLog: NotificationLog = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    const updated = [newLog, ...notifications];
    setNotificationsState(updated);
    saveStoredNotifications(updated);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotificationsState(updated);
    saveStoredNotifications(updated);
  };

  // User Registration - OPEN TO ALL EMAIL DOMAINS (no domain restriction)
  const registerUser = async (
    name: string,
    email: string,
    password: string,
    targetRole: Role,
    batch?: string,
    targetExam?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name.trim(),
      email: cleanEmail,
      role: targetRole,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
      batch: targetRole === 'student' ? (batch || 'General Batch') : undefined,
      targetExam: targetRole === 'student' ? ((targetExam as any) || 'JEE Advanced') : undefined,
      phone: phone || '',
      createdAt: new Date().toISOString().split('T')[0],
      streak: 0,
      totalStudyHours: 0,
      attendanceRate: 100,
      status: 'active'
    };

    const nextUsers = [...users, newUser];
    updateUsers(nextUsers);
    setCurrentUser(newUser);
    localStorage.setItem('mcd_active_user_id', newUser.id);
    setCurrentRoute(targetRole);

    addNotification({
      userId: newUser.id,
      type: 'faculty_feedback',
      channel: 'in_app',
      title: 'Welcome to Meccademia!',
      message: `Welcome ${newUser.name}. Your 7-day schedule canvas is ready. Add your daily study and routine slots to begin.`,
      status: 'delivered'
    });

    return { success: true };
  };

  const login = async (email: string, pass: string, targetRole: Role): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass, role: targetRole })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      // If Admin authenticated
      if (targetRole === 'admin') {
        const adminUser = users.find(u => u.role === 'admin') || {
          id: 'admin_1',
          name: 'Administrator',
          email: 'ssachh2@gmail.com',
          role: 'admin' as Role,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: '2026-01-10',
          streak: 0,
          totalStudyHours: 0,
          attendanceRate: 100,
          status: 'active' as const
        };
        setCurrentUser(adminUser);
        localStorage.setItem('mcd_active_user_id', adminUser.id);
        setCurrentRoute('admin');
        return { success: true };
      }

      // Student or Faculty login
      const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === targetRole);
      if (foundUser) {
        setCurrentUser(foundUser);
        localStorage.setItem('mcd_active_user_id', foundUser.id);
        setCurrentRoute(targetRole);
        return { success: true };
      } else {
        return { success: false, error: `No registered ${targetRole} account found with email "${email}". Please register first using the Create Account tab.` };
      }
    } catch (e: any) {
      console.error(e);
      return { success: false, error: 'Network error or service unavailable.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mcd_active_user_id');
    setCurrentRoute('login_student');
  };

  const role: Role | null = currentUser ? currentUser.role : null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        currentRoute,
        setRoute: setCurrentRoute,
        login,
        registerUser,
        logout,
        users,
        updateUsers,
        slots,
        updateSlots,
        weeklyTargets,
        updateWeeklyTargets,
        monthlyTargets,
        updateMonthlyTargets,
        tasks,
        updateTasks,
        notifications,
        addNotification,
        markNotificationRead,
        isDarkMode,
        toggleDarkMode
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
