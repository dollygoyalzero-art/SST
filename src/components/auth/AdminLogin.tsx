import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setRoute } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password, 'admin');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid administrator credentials. Access denied.');
    }
  };

  const handleAdminDirectAccess = async () => {
    setError(null);
    setLoading(true);
    // Explicit bypass authenticating seeded administrator without revealing credentials on UI
    const res = await login('ssachh2@gmail.com', 'admin123', 'admin');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Administrative session verification failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-800 p-8 relative overflow-hidden">
        
        {/* Security badge ribbon */}
        <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none overflow-hidden">
          <div className="absolute transform rotate-45 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-sm">
            RESTRICTED
          </div>
        </div>

        {/* Admin Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 flex items-center justify-center text-amber-400 shadow-xl mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 mb-1">
            Central Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Meccademia Command Suite
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise user management, faculty-student mentorship matrix, and institute audit logs.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="administrator@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            {loading ? (
              <span>Verifying Administrative Session...</span>
            ) : (
              <>
                <span>Authenticate Administrator</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Administrator Instant Sign-In (no credentials displayed in UI) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleAdminDirectAccess}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Administrator Instant Sign-In</span>
          </button>
        </div>

        {/* Portal Links */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setRoute('login_student')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            &larr; Student Portal
          </button>
          <button
            onClick={() => setRoute('login_faculty')}
            className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Faculty Portal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
