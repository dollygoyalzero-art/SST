import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
  KeyRound,
  Inbox,
  Copy,
  Check,
  AlertCircle,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const StudentLogin: React.FC = () => {
  const { login, registerUser, forgotPassword, resetPassword, setRoute, users } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form states (open to ANY email domain)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regBatch, setRegBatch] = useState('Apex Batch (JEE Advanced 2027)');
  const [regExam, setRegExam] = useState<'JEE Advanced' | 'JEE Main' | 'NEET' | 'CBSE Boards'>('JEE Advanced');
  const [regPhone, setRegPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Recovery / Reset Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [simulatedEmail, setSimulatedEmail] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  const [showStudentList, setShowStudentList] = useState(false);

  // List of registered students for quick assistance / preview
  const registeredStudents = users.filter(u => u.role === 'student');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = await login(email, password, 'student');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to authenticate student account');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const res = await registerUser(regName, regEmail, regPassword, 'student', regBatch, regExam, regPhone);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    }
  };

  const openResetModal = () => {
    setError(null);
    setResetError(null);
    setResetSuccess(null);
    setResetEmail(email.trim());
    setResetCode('');
    setReceivedCode(null);
    setSimulatedEmail(null);
    setNewPassword('');
    setConfirmPassword('');
    setResetStep('request');
    setShowResetModal(true);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    if (!resetEmail.trim()) {
      setResetError('Please enter your student email address');
      return;
    }

    setResetLoading(true);
    const res = await forgotPassword(resetEmail.trim(), 'student');
    setResetLoading(false);

    if (!res.success) {
      setResetError(res.error || 'No account found with this email.');
      return;
    }

    setReceivedCode(res.code || '123456');
    setResetCode(res.code || '');
    setSimulatedEmail(res.simulatedEmail || null);
    setResetStep('verify');
    setResetSuccess('Reset code generated! See verification details below.');
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetCode.trim()) {
      setResetError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setResetError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    const res = await resetPassword(resetEmail.trim(), resetCode.trim(), newPassword);
    setResetLoading(false);

    if (!res.success) {
      setResetError(res.error || 'Failed to update password.');
      return;
    }

    // Success! Pre-fill login credentials
    setEmail(resetEmail.trim());
    setPassword(newPassword);
    setSuccessMsg('Your password has been successfully updated! You can now log in.');
    setShowResetModal(false);
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFillStudent = (studentEmail: string) => {
    setEmail(studentEmail);
    setPassword('student123'); // Default fallback password or prompts them
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 relative">
        
        {/* Academic Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 mb-1">
            Student Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Meccademia Scholar Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build your 7-day canvas schedule, track targets, and monitor your consistency.
          </p>
        </div>

        {/* Tab switch between Sign In and Create Account */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-lg transition ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-lg transition ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {error.toLowerCase().includes('password') && (
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={openResetModal}
                    className="font-bold underline text-indigo-600 dark:text-indigo-400 hover:opacity-80"
                  >
                    Click here to reset your password &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Email Address (Any Domain)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openResetModal}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot Password?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Student Account...</span>
              ) : (
                <>
                  <span>Sign In to Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Any email domain accepted)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@gmail.com, student@yahoo.com, etc."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Exam
                </label>
                <select
                  value={regExam}
                  onChange={e => setRegExam(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="NEET">NEET (Medical)</option>
                  <option value="CBSE Boards">CBSE Boards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batch / Program
                </label>
                <input
                  type="text"
                  value={regBatch}
                  onChange={e => setRegBatch(e.target.value)}
                  placeholder="Apex Batch 2027"
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create your password"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              {loading ? (
                <span>Setting up Scholar Workspace...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Open 7-Day Canvas</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Registered Students Helper Drawer */}
        {registeredStudents.length > 0 && mode === 'login' && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowStudentList(!showStudentList)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span>Registered Student Accounts ({registeredStudents.length})</span>
              {showStudentList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showStudentList && (
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {registeredStudents.map(s => (
                  <div
                    key={s.id}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFillStudent(s.email)}
                      className="px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                    >
                      Fill
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portal Switching Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Are you a mentor?</span>
          <button
            onClick={() => setRoute('login_faculty')}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Faculty Gateway &rarr;
          </button>
        </div>
        <div className="mt-2 text-center">
          <button
            onClick={() => setRoute('login_admin')}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
          >
            Central Administration Command
          </button>
        </div>

      </div>

      {/* Interactive Password Assistance & Recovery Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Student Password Recovery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verify your student ID and set a new password.
                </p>
              </div>
            </div>

            {/* Transparency Note about Sandbox Mail */}
            <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
              <Inbox className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Why you might not receive an external email:</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  In this application environment without an external SMTP mail server configured, verification codes are delivered <strong>directly on this screen</strong> and logged into your in-app inbox below.
                </p>
              </div>
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{resetError}</p>
                  {resetError.toLowerCase().includes('no account') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetModal(false);
                        setMode('register');
                        setRegEmail(resetEmail);
                      }}
                      className="mt-1 font-bold text-indigo-600 dark:text-indigo-400 underline"
                    >
                      Click here to Create an Account with this email &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Enter the email you used when creating your Meccademia account.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {resetLoading ? (
                      <span>Generating Code...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Send 6-Digit Reset Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Visual OTP Badge for instant clarity */}
                {receivedCode && (
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                        Dispatched Verification OTP
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(receivedCode)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 my-2">
                      <div className="text-2xl font-mono font-extrabold tracking-widest text-indigo-900 dark:text-indigo-100 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700">
                        {receivedCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => setResetCode(receivedCode)}
                        className="text-xs px-3 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                      >
                        Auto-fill Code
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Dispatched to: <span className="font-semibold text-slate-700 dark:text-slate-300">{resetEmail}</span> (Valid for 15 minutes)
                    </p>

                    {/* Expandable Simulated Email Message */}
                    {simulatedEmail && (
                      <div className="mt-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/60">
                        <button
                          type="button"
                          onClick={() => setShowEmailDetails(!showEmailDetails)}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <Inbox className="w-3 h-3" />
                          <span>{showEmailDetails ? 'Hide Dispatched Email' : 'Preview Dispatched Email'}</span>
                        </button>

                        {showEmailDetails && (
                          <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 font-mono text-slate-700 dark:text-slate-300">
                            <div><strong className="text-slate-900 dark:text-slate-100">From:</strong> {simulatedEmail.from}</div>
                            <div><strong className="text-slate-900 dark:text-slate-100">To:</strong> {simulatedEmail.to}</div>
                            <div><strong className="text-slate-900 dark:text-slate-100">Subject:</strong> {simulatedEmail.subject}</div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-sans text-xs whitespace-pre-line text-slate-600 dark:text-slate-400">
                              {simulatedEmail.body}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleExecuteReset} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value.trim())}
                      placeholder="e.g. 123456"
                      className="w-full px-3 py-2 text-sm font-mono tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      &larr; Back to Email
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      {resetLoading ? (
                        <span>Updating Password...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Save New Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
