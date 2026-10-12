import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';
import {
  GraduationCap, Bell, UserCheck, Shield, BookOpen,
  LogOut, ChevronDown, Clock
} from 'lucide-react';

interface HeaderProps {
  onOpenBlueprint: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBlueprint }) => {
  const {
    currentUser, currentRoute, setRoute, logout,
    users, notifications, markNotificationRead
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => currentUser ? setRoute(currentUser.role) : setRoute('login_student')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 dark:from-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
                MECCADEMIA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                EDUCATION
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Student Success Tracker</p>
          </div>
        </div>

        {/* Portal & Role Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {currentUser && (
            <>
              {/* Students only see their Student Portal */}
              {currentUser.role === 'student' && (
                <button
                  onClick={() => setRoute('student')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    currentRoute === 'student'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>
              )}

              {/* Faculty mentors only see Faculty Portal */}
              {currentUser.role === 'faculty' && (
                <button
                  onClick={() => setRoute('faculty')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    currentRoute === 'faculty'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Faculty Mentor</span>
                </button>
              )}

              {/* Only Administrator has access to Admin Suite */}
              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => setRoute('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentRoute === 'admin'
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Suite</span>
                  </button>
                  <button
                    onClick={() => setRoute('student')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentRoute === 'student'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Inspect Student View</span>
                  </button>
                  <button
                    onClick={() => setRoute('faculty')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentRoute === 'faculty'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Inspect Faculty View</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* Architecture Blueprint Button */}
          <button
            onClick={onOpenBlueprint}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 border cursor-pointer ${
              currentRoute === 'blueprint'
                ? 'bg-amber-500 text-white border-amber-600'
                : 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture Blueprint</span>
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-2.5">
          {/* Functional Dark/Light Mode using next-themes */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Alerts & Reminders</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      {unreadCount} new
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Email & WhatsApp Synced</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !notif.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{notif.timestamp}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                      <div className="mt-1.5 flex items-center space-x-2 text-[10px]">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {notif.channel}
                        </span>
                        {!notif.read && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Mark as read</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-500"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] capitalize text-slate-500 dark:text-slate-400">
                    {currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                    {currentUser.batch && (
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">{currentUser.batch}</p>
                    )}
                  </div>

                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Active Role:</span>
                        <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Status:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active Session</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center space-x-2 cursor-pointer font-semibold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setRoute('login_student')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
