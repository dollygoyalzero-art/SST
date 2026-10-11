/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { VoiceMentorModal } from './components/ai/VoiceMentorModal';

const AppContent: React.FC = () => {
  const { currentRoute, setRoute, currentUser } = useAuth();
  const [isVoiceMentorOpen, setIsVoiceMentorOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header
        onOpenVoiceMentor={() => setIsVoiceMentorOpen(true)}
        onOpenBlueprint={() => setRoute('blueprint')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRoute === 'student' && <StudentDashboard />}
        {currentRoute === 'faculty' && <FacultyDashboard />}
        {currentRoute === 'admin' && <AdminDashboard />}
        {currentRoute === 'login_student' && <StudentLogin />}
        {currentRoute === 'login_faculty' && <FacultyLogin />}
        {currentRoute === 'login_admin' && <AdminLogin />}
        {currentRoute === 'blueprint' && (
          <ArchitectureViewer onClose={() => setRoute(currentUser ? currentUser.role : 'student')} />
        )}
      </main>

      <Footer />

      {/* Gemini 3.8 Live Voice Mentor Modal */}
      <VoiceMentorModal
        isOpen={isVoiceMentorOpen}
        onClose={() => setIsVoiceMentorOpen(false)}
        studentName={currentUser?.name || 'Scholar'}
      />
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
