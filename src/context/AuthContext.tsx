import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../components/theme/ThemeProvider';
import { User, Role, StudySlot, WeeklyTarget, MonthlyTarget, TaskLog, NotificationLog, SlotComment } from '../types';
import {
  getStoredUsers, saveStoredUsers,
  getStoredSlots, saveStoredSlots,
  getStoredWeeklyTargets, saveStoredWeeklyTargets,
  getStoredMonthlyTargets, saveStoredMonthlyTargets,
  getStoredTasks, saveStoredTasks,
  getStoredNotifications, saveStoredNotifications,
  storeUserCredential, getUserCredential
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
  forgotPassword: (email: string, role?: Role) => Promise<{
    success: boolean;
    code?: string;
    expiresAt?: number;
    simulatedEmail?: any;
    notice?: string;
    error?: string;
  }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  logout: () => void;
  users: User[];
  updateUsers: (newUsers: User[]) => void;
  fetchUsers: () => Promise<void>;
  isSyncingUsers: boolean;
  slots: StudySlot[];
  updateSlots: (newSlots: StudySlot[]) => void;
  addSlotComment: (slotId: string, commentText: string, type?: SlotComment['type']) => void;
  addTargetComment: (targetId: string, commentText: string, type?: SlotComment['type']) => void;
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [users, setUsersState] = useState<User[]>(getStoredUsers);
  const [isSyncingUsers, setIsSyncingUsers] = useState<boolean>(false);
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
        if (savedId === 'admin_1') {
          return {
            id: 'admin_1',
            name: 'Administrator',
            email: 'ssachh2@gmail.com',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            createdAt: '2026-01-10',
            streak: 0,
            totalStudyHours: 0,
            attendanceRate: 100,
            status: 'active'
          };
        }
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

  // Role-Based Access Control (RBAC) Route Guard
  const safeSetRoute = useCallback((route: AppRoute) => {
    if (currentUser?.role === 'student') {
      if (route === 'admin' || route === 'faculty' || route === 'login_admin' || route === 'login_faculty') {
        console.warn('Access denied: Student accounts are restricted to the Student Portal.');
        setCurrentRoute('student');
        return;
      }
    } else if (currentUser?.role === 'faculty') {
      if (route === 'admin' || route === 'login_admin') {
        console.warn('Access denied: Faculty accounts are restricted from the Admin Suite.');
        setCurrentRoute('faculty');
        return;
      }
    }
    setCurrentRoute(route);
  }, [currentUser]);

  // Synchronize route with active user permissions
  useEffect(() => {
    if (currentUser?.role === 'student') {
      if (currentRoute === 'admin' || currentRoute === 'faculty' || currentRoute === 'login_admin' || currentRoute === 'login_faculty') {
        setCurrentRoute('student');
      }
    } else if (currentUser?.role === 'faculty') {
      if (currentRoute === 'admin' || currentRoute === 'login_admin') {
        setCurrentRoute('faculty');
      }
    }
  }, [currentUser, currentRoute]);

  // Real-time synchronization of users with the backend database
  const fetchUsers = useCallback(async () => {
    try {
      setIsSyncingUsers(true);

      // 1. Push any local cached users to server sync endpoint
      const stored = getStoredUsers();
      if (Array.isArray(stored) && stored.length > 0) {
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: stored })
        }).catch(() => {});
      }

      // 2. Fetch authoritative user list from server
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsersState(data.users);
          saveStoredUsers(data.users);
        }
      }
    } catch (err) {
      console.warn('Real-time sync falling back to local storage cache:', err);
    } finally {
      setIsSyncingUsers(false);
    }
  }, []);

  // Poll users from backend periodically so newly registered students instantly appear on Admin's screen
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const updateUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    saveStoredUsers(newUsers);
    if (currentUser) {
      const updatedCurrent = newUsers.find(u => u.id === currentUser.id);
      if (updatedCurrent) setCurrentUser(updatedCurrent);
    }
    // Asynchronously sync with server
    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: newUsers })
    }).catch(err => console.warn('Failed to sync users with server:', err));
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

  // Schedule Commenting System: Mentors add text comments directly to specific study slots
  const addSlotComment = (slotId: string, commentText: string, type: SlotComment['type'] = 'motivational') => {
    if (!currentUser || !commentText.trim()) return;

    const newComment: SlotComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      facultyId: currentUser.id,
      facultyName: currentUser.name,
      slotId,
      comment: commentText.trim(),
      type,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let targetStudentId = '';
    const updatedSlots = slots.map(s => {
      if (s.id === slotId) {
        targetStudentId = s.studentId;
        const currentComments = s.comments || [];
        return { ...s, comments: [...currentComments, newComment] };
      }
      return s;
    });

    updateSlots(updatedSlots);

    if (targetStudentId) {
      addNotification({
        userId: targetStudentId,
        type: 'faculty_feedback',
        channel: 'whatsapp',
        title: `Mentor Comment from ${currentUser.name}`,
        message: commentText.trim(),
        status: 'delivered'
      });
    }
  };

  // Schedule Commenting System: Mentors add text comments directly to specific weekly targets
  const addTargetComment = (targetId: string, commentText: string, type: SlotComment['type'] = 'approval') => {
    if (!currentUser || !commentText.trim()) return;

    const newComment: SlotComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      facultyId: currentUser.id,
      facultyName: currentUser.name,
      targetId,
      comment: commentText.trim(),
      type,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let targetStudentId = '';
    const updatedTargets = weeklyTargets.map(t => {
      if (t.id === targetId) {
        targetStudentId = t.studentId;
        const currentComments = t.comments || [];
        return {
          ...t,
          comments: [...currentComments, newComment],
          facultyNotes: commentText.trim()
        };
      }
      return t;
    });

    updateWeeklyTargets(updatedTargets);

    if (targetStudentId) {
      addNotification({
        userId: targetStudentId,
        type: 'target_alert',
        channel: 'in_app',
        title: `Target Review from ${currentUser.name}`,
        message: commentText.trim(),
        status: 'delivered'
      });
    }
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

    try {
      // Store local credential immediately
      storeUserCredential(cleanEmail, password);

      // Register with backend endpoint so it propagates in real-time
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          password: password,
          role: targetRole,
          batch,
          targetExam,
          phone
        })
      });

      let newUser: User;
      if (res.ok) {
        const data = await res.json();
        newUser = data.user;
      } else {
        // Fallback to local creation if server returns an error
        newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: name.trim(),
          email: cleanEmail,
          role: targetRole,
          avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
          batch: targetRole === 'student' ? (batch || 'Apex Batch (JEE Advanced 2027)') : undefined,
          targetExam: targetRole === 'student' ? ((targetExam as any) || 'JEE Advanced') : undefined,
          phone: phone || '',
          createdAt: new Date().toISOString().split('T')[0],
          streak: 0,
          totalStudyHours: 0,
          attendanceRate: 100,
          status: 'active'
        };
      }

      const nextUsers = [newUser, ...users.filter(u => u.email.toLowerCase() !== cleanEmail)];
      updateUsers(nextUsers);
      setCurrentUser(newUser);
      localStorage.setItem('mcd_active_user_id', newUser.id);
      setCurrentRoute(targetRole);

      addNotification({
        userId: newUser.id,
        type: 'faculty_feedback',
        channel: 'in_app',
        title: 'Welcome to Meccademia!',
        message: `Welcome ${newUser.name}. Your study dashboard is live. Add study and routine slots to start tracking your entrance exam targets.`,
        status: 'delivered'
      });

      return { success: true };
    } catch (e: any) {
      console.error('Registration error:', e);
      return { success: false, error: e.message || 'Registration failed' };
    }
  };

  /**
   * CRITICAL REQUIREMENT 1:
   * Explicitly check if the user inputs Email: "ssachh2@gmail.com" and Password: "admin123".
   * If true, bypass standard DB auth, assign the "Admin" role, and route them to the Admin Dashboard.
   */
  const login = async (email: string, pass: string, targetRole: Role): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. HARDCODED ADMIN EXPLICIT BYPASS CHECK
    if (cleanEmail === 'ssachh2@gmail.com' && pass === 'admin123') {
      const adminUser: User = {
        id: 'admin_1',
        name: 'Administrator',
        email: 'ssachh2@gmail.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-10',
        streak: 0,
        totalStudyHours: 0,
        attendanceRate: 100,
        status: 'active'
      };

      // Ensure admin exists in user list
      setUsersState(prev => prev.some(u => u.id === 'admin_1') ? prev : [adminUser, ...prev]);
      setCurrentUser(adminUser);
      localStorage.setItem('mcd_active_user_id', adminUser.id);
      setCurrentRoute('admin');
      return { success: true };
    }

    if (targetRole === 'admin') {
      return { success: false, error: 'Invalid administrator credentials. Access denied.' };
    }

    // 2. Student & Faculty Authentication
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass, role: targetRole })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      // Check registered users in local state or use server response user
      const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.role === targetRole);
      const activeUser = foundUser || (data.user as User | undefined);

      if (activeUser) {
        // Cache credentials locally
        storeUserCredential(cleanEmail, pass);
        if (!foundUser && data.user) {
          setUsersState(prev => [data.user, ...prev.filter(u => u.email.toLowerCase() !== cleanEmail)]);
        }
        setCurrentUser(activeUser);
        localStorage.setItem('mcd_active_user_id', activeUser.id);
        setCurrentRoute(targetRole);
        return { success: true };
      } else {
        return {
          success: false,
          error: `No registered ${targetRole} account found with email "${email}". Please register using the Create Account tab.`
        };
      }
    } catch (e: any) {
      console.error('Login error:', e);
      // Offline / fallback verification
      const localCred = getUserCredential(cleanEmail);
      const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.role === targetRole);
      if (foundUser) {
        if (localCred && localCred !== pass) {
          return { success: false, error: 'Incorrect password. Please verify your credentials or click "Forgot Password?".' };
        }
        setCurrentUser(foundUser);
        localStorage.setItem('mcd_active_user_id', foundUser.id);
        setCurrentRoute(targetRole);
        return { success: true };
      }
      return { success: false, error: 'Network error or service unavailable.' };
    }
  };

  const forgotPassword = async (
    email: string,
    targetRole?: Role
  ): Promise<{
    success: boolean;
    code?: string;
    expiresAt?: number;
    simulatedEmail?: any;
    notice?: string;
    error?: string;
  }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role: targetRole })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to request password reset code' };
      }

      // Create an in-app notification so the student sees it in their notification bell
      if (data.user?.id) {
        addNotification({
          userId: data.user.id,
          type: 'faculty_feedback',
          channel: 'in_app',
          title: 'Student Password Reset Code Dispatched',
          message: `Your 6-digit verification code is: ${data.code}. This code expires in 15 minutes.`,
          status: 'delivered'
        });
      }

      return {
        success: true,
        code: data.code,
        expiresAt: data.expiresAt,
        simulatedEmail: data.simulatedEmail,
        notice: data.notice
      };
    } catch (e: any) {
      console.error('forgotPassword error:', e);
      // Fallback check against local users
      const localUser = users.find(u => u.email.toLowerCase() === cleanEmail && (!targetRole || u.role === targetRole));
      if (!localUser) {
        return { success: false, error: `No registered account found for "${email}".` };
      }
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        success: true,
        code: fallbackCode,
        expiresAt: Date.now() + 15 * 60 * 1000,
        simulatedEmail: {
          id: `eml_${Date.now()}`,
          from: 'support@meccademia.edu',
          fromName: 'Meccademia Scholar Portal Administration',
          to: cleanEmail,
          recipientName: localUser.name,
          subject: `Password Reset Verification Code - ${localUser.name}`,
          sentAt: new Date().toISOString(),
          code: fallbackCode,
          body: `Hello ${localUser.name},\n\nYour 6-digit verification code is: ${fallbackCode}`
        },
        notice: 'Dispatched via local simulation fallback.'
      };
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update password' };
      }

      storeUserCredential(cleanEmail, newPassword);
      return { success: true, message: data.message };
    } catch (e: any) {
      console.error('resetPassword error:', e);
      storeUserCredential(cleanEmail, newPassword);
      return { success: true, message: 'Password updated successfully in local storage.' };
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
        setRoute: safeSetRoute,
        login,
        registerUser,
        forgotPassword,
        resetPassword,
        logout,
        users,
        updateUsers,
        fetchUsers,
        isSyncingUsers,
        slots,
        updateSlots,
        addSlotComment,
        addTargetComment,
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
