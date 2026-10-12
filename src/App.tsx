/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { StudentDashboard } from './components/student/StudentDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentLogin } from './components/auth/StudentLogin';
import { FacultyLogin } from './components/auth/FacultyLogin';
import { AdminLogin } from './components/auth/AdminLogin';
import { ArchitectureViewer } from './components/docs/ArchitectureViewer';
import { Shield, AlertTriangle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute, setRoute, currentUser } = useAuth();

  // Strict Role-Based Access Control (RBAC) Enforcement
  useEffect(() => {
    if (currentUser?.role === 'student') {
      if (
        currentRoute === 'admin' ||
        currentRoute === 'faculty' ||
        currentRoute === 'login_admin' ||
        currentRoute === 'login_faculty'
      ) {
        setRoute('student');
      }
    } else if (currentUser?.role === 'faculty') {
      if (currentRoute === 'admin' || currentRoute === 'login_admin') {
        setRoute('faculty');
      }
    }
  }, [currentUser, currentRoute, setRoute]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Header onOpenBlueprint={() => setRoute('blueprint')} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Student Dashboard - Only accessible by students or inspecting admins */}
        {currentRoute === 'student' && (
          currentUser?.role === 'student' || currentUser?.role === 'admin' ? (
            <StudentDashboard />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-800 text-center shadow-xl">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Student Portal Access</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Please log in with a student account to view the 7-day student study canvas.
              </p>
              <button
                onClick={() => setRoute('login_student')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Sign In as Student
              </button>
            </div>
          )
        )}

        {/* Faculty Dashboard - Only accessible by faculty or inspecting admins */}
        {currentRoute === 'faculty' && (
          currentUser?.role === 'faculty' || currentUser?.role === 'admin' ? (
            <FacultyDashboard />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-800 text-center shadow-xl">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Faculty Mentorship Restricted</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                You are currently signed in as a student. Student accounts cannot access the faculty mentorship workspace.
              </p>
              <button
                onClick={() => setRoute('student')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Return to Student Portal
              </button>
            </div>
          )
        )}

        {/* Admin Dashboard - STRICTLY RESTRICTED TO ADMIN */}
        {currentRoute === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-800 text-center shadow-xl">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Restricted Command Area</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Central administration privileges required. Student and faculty accounts are not authorized to view or manage institute records.
              </p>
              <button
                onClick={() => setRoute(currentUser ? currentUser.role : 'login_student')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Return to {currentUser ? 'My Portal' : 'Login'}
              </button>
            </div>
          )
        )}

        {/* Auth routes */}
        {currentRoute === 'login_student' && <StudentLogin />}
        {currentRoute === 'login_faculty' && <FacultyLogin />}
        {currentRoute === 'login_admin' && <AdminLogin />}

        {/* Architecture Blueprint */}
        {currentRoute === 'blueprint' && (
          <ArchitectureViewer onClose={() => setRoute(currentUser ? currentUser.role : 'student')} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
