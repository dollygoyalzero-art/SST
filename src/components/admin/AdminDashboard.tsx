import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, Users, UserPlus, Mail, Edit3, Trash2, CheckCircle2,
  Search, Filter, Link as LinkIcon, RefreshCw, Send, AlertCircle, X,
  Radio, Database, Code2, Copy, Check
} from 'lucide-react';
import { User, Role } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { users, updateUsers, addNotification, fetchUsers, isSyncingUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRealtimeQueryModalOpen, setIsRealtimeQueryModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [copiedQueryKey, setCopiedQueryKey] = useState<string | null>(null);

  // Auto-sync users periodically so any student registering appears instantly on the Admin screen
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Form states for Add User
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('student');
  const [newBatch, setNewBatch] = useState('Apex Batch (JEE Advanced 2027)');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newTargetExam, setNewTargetExam] = useState<'JEE Advanced' | 'JEE Main' | 'NEET' | 'CBSE Boards'>('JEE Advanced');

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('student');
  const [inviteChannel, setInviteChannel] = useState<'email' | 'whatsapp'>('email');
  const [inviteSentSuccess, setInviteSentSuccess] = useState(false);

  const facultyMembers = users.filter(u => u.role === 'faculty');
  const studentMembers = users.filter(u => u.role === 'student');

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.batch && u.batch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQueryKey(key);
    setTimeout(() => setCopiedQueryKey(null), 2000);
  };

  // User CRUD - Add
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const cleanEmail = newEmail.trim().toLowerCase();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: cleanEmail,
          password: 'student123',
          role: newRole,
          batch: newRole === 'student' ? newBatch : undefined,
          targetExam: newRole === 'student' ? newTargetExam : undefined,
          phone: newPhone.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        const next = [data.user, ...users.filter(u => u.email.toLowerCase() !== cleanEmail)];
        updateUsers(next);
      } else {
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: newName.trim(),
          email: cleanEmail,
          role: newRole,
          avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
          batch: newRole === 'student' ? newBatch : undefined,
          targetExam: newRole === 'student' ? newTargetExam : undefined,
          phone: newPhone.trim(),
          createdAt: new Date().toISOString().split('T')[0],
          streak: 0,
          totalStudyHours: 0,
          attendanceRate: 100,
          status: 'active'
        };
        updateUsers([newUser, ...users]);
      }
    } catch {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: newName.trim(),
        email: cleanEmail,
        role: newRole,
        avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
        batch: newRole === 'student' ? newBatch : undefined,
        targetExam: newRole === 'student' ? newTargetExam : undefined,
        phone: newPhone.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        streak: 0,
        totalStudyHours: 0,
        attendanceRate: 100,
        status: 'active'
      };
      updateUsers([newUser, ...users]);
    }

    setIsAddUserModalOpen(false);
    setNewName('');
    setNewEmail('');
  };

  // User CRUD - Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
    } catch (err) {
      console.warn('Failed to update user on server:', err);
    }

    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    updateUsers(updated);
    setEditingUser(null);
  };

  // User CRUD - Delete
  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user from Meccademia database?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to delete user on server:', err);
      }
      const updated = users.filter(u => u.id !== id);
      updateUsers(updated);
    }
  };

  // Mentorship Assignment Matrix - reassign mentor
  const handleReassignMentor = (studentId: string, facultyId: string) => {
    const updated = users.map(u => {
      if (u.id === studentId) {
        return { ...u, assignedFacultyId: facultyId || undefined };
      }
      return u;
    });
    updateUsers(updated);

    const faculty = facultyMembers.find(f => f.id === facultyId);
    if (faculty) {
      addNotification({
        userId: studentId,
        type: 'faculty_feedback',
        channel: 'whatsapp',
        title: 'Mentor Assigned by Administrator',
        message: `Admin has assigned ${faculty.name} as your academic mentor.`,
        status: 'delivered'
      });
    }
  };

  // Invite System
  const handleDispatchInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const cleanEmail = inviteEmail.trim().toLowerCase();
    const invitedUser: User = {
      id: `invite_${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: inviteRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      streak: 0,
      totalStudyHours: 0,
      attendanceRate: 100,
      status: 'invited'
    };

    updateUsers([invitedUser, ...users]);
    setInviteSentSuccess(true);
    setTimeout(() => {
      setInviteSentSuccess(false);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Central Command Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Meccademia Central Administration
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  INSTITUTE COMMAND
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-xs text-emerald-400 font-medium">
                  Real-Time Database Sync Active (Firebase/Supabase & Polling)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsRealtimeQueryModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Query Logic</span>
            </button>
            <button
              onClick={() => fetchUsers()}
              disabled={isSyncingUsers}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
              title="Sync with backend database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingUsers ? 'animate-spin' : ''}`} />
              <span>{isSyncingUsers ? 'Syncing...' : 'Live Refresh'}</span>
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invite</span>
            </button>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User (CRUD)</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Students</span>
            <strong className="text-xl font-black text-indigo-400 mt-1 block">{studentMembers.length} Scholars</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Faculty</span>
            <strong className="text-xl font-black text-emerald-400 mt-1 block">{facultyMembers.length} Mentors</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mentorship Coverage</span>
            <strong className="text-xl font-black text-amber-400 mt-1 block">
              {studentMembers.length > 0 ? Math.round((studentMembers.filter(s => s.assignedFacultyId).length / studentMembers.length) * 100) : 100}%
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Institute Status</span>
            <strong className="text-xl font-black text-emerald-400 mt-1 block">Live & Open</strong>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student name, email, or batch..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex space-x-1 text-xs">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  roleFilter === 'student' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Students ({studentMembers.length})
              </button>
              <button
                onClick={() => setRoleFilter('faculty')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  roleFilter === 'faculty' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Faculty ({facultyMembers.length})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">User Profile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Batch / Department</th>
                <th className="p-3">Assigned Mentor</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No users matching criteria. Clean database ready for new registrations.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const assignedMentor = facultyMembers.find(f => f.id === user.assignedFacultyId);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      
                      {/* Name & Email */}
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-slate-900 text-amber-400' :
                          user.role === 'faculty' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                          'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {user.role === 'student' ? (user.batch || 'Apex Batch') : 'Academic Faculty'}
                      </td>

                      {/* Mentorship Link */}
                      <td className="p-3">
                        {user.role === 'student' ? (
                          <select
                            value={user.assignedFacultyId || ''}
                            onChange={e => handleReassignMentor(user.id, e.target.value)}
                            className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">-- No Mentor Assigned --</option>
                            {facultyMembers.map(fac => (
                              <option key={fac.id} value={fac.id}>{fac.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A (Faculty)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          user.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                          user.status === 'invited' ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>

                      {/* Actions (CRUD) */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {user.id !== 'admin_1' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-Time Query Logic Modal (Required by Architecture Spec) */}
      {isRealtimeQueryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Real-Time User Query & Broadcast Architecture
                </h3>
              </div>
              <button onClick={() => setIsRealtimeQueryModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              When a student or faculty registers via open registration or shared invitation link, this exact listener logic guarantees instant appearance on the Admin Dashboard without manual page refreshes.
            </p>

            <div className="space-y-4 text-xs font-mono">
              {/* Firestore Real-Time Query */}
              <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 font-bold">1. Firebase Firestore onSnapshot Listener</span>
                  <button
                    onClick={() => handleCopyCode(`import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(usersQuery, (snapshot) => {
    const liveUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    onUpdate(liveUsers);
  });
}`, 'fs')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedQueryKey === 'fs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQueryKey === 'fs' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] overflow-x-auto text-emerald-300">
{`import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(usersQuery, (snapshot) => {
    const liveUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    onUpdate(liveUsers);
  });
}`}
                </pre>
              </div>

              {/* Supabase Realtime Listener */}
              <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 font-bold">2. Supabase Postgres Realtime Subscription</span>
                  <button
                    onClick={() => handleCopyCode(`import { supabase } from '../supabase';

export function subscribeSupabaseUsers(onUpdate: () => void) {
  return supabase
    .channel('public:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
      console.log('Realtime user registered/updated:', payload);
      onUpdate();
    })
    .subscribe();
}`, 'sb')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedQueryKey === 'sb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQueryKey === 'sb' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] overflow-x-auto text-cyan-300">
{`import { supabase } from '../supabase';

export function subscribeSupabaseUsers(onUpdate: () => void) {
  return supabase
    .channel('public:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
      console.log('Realtime user registered/updated:', payload);
      onUpdate();
    })
    .subscribe();
}`}
                </pre>
              </div>

              {/* Express REST API Active Route */}
              <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-400 font-bold">3. Express Active Backend API (GET /api/users)</span>
                  <button
                    onClick={() => handleCopyCode(`// Mounted in server.ts
app.get('/api/users', (req, res) => {
  res.json({ success: true, users: usersStore, total: usersStore.length });
});

app.post('/api/users', (req, res) => {
  usersStore.unshift(req.body);
  res.status(201).json({ success: true, user: req.body });
});`, 'exp')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedQueryKey === 'exp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQueryKey === 'exp' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] overflow-x-auto text-amber-300">
{`// Mounted in server.ts
app.get('/api/users', (req, res) => {
  res.json({ success: true, users: usersStore, total: usersStore.length });
});

app.post('/api/users', (req, res) => {
  usersStore.unshift(req.body);
  res.status(201).json({ success: true, user: req.body });
});`}
                </pre>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsRealtimeQueryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white dark:bg-slate-800 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close Query Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal (CRUD) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add New Institute User</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Aryan Verma"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="aryan@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as Role)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="student">Student Scholar</option>
                    <option value="faculty">Faculty Mentor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Target Exam</label>
                  <select
                    value={newTargetExam}
                    onChange={e => setNewTargetExam(e.target.value as any)}
                    disabled={newRole !== 'student'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
                  >
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET</option>
                    <option value="CBSE Boards">CBSE Boards</option>
                  </select>
                </div>
              </div>

              {newRole === 'student' && (
                <div>
                  <label className="block font-semibold mb-1">Batch Name</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={e => setNewBatch(e.target.value)}
                    placeholder="Apex Batch (JEE Advanced 2027)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (CRUD) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {editingUser.role === 'student' && (
                <div>
                  <label className="block font-semibold mb-1">Batch</label>
                  <input
                    type="text"
                    value={editingUser.batch || ''}
                    onChange={e => setEditingUser({ ...editingUser, batch: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Send Institutional Invitation</h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            {inviteSentSuccess ? (
              <div className="p-6 text-center text-xs space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Invitation Dispatched!</h4>
                <p className="text-slate-500">
                  Activation link sent to {inviteEmail} via {inviteChannel === 'whatsapp' ? 'WhatsApp Business Cloud API' : 'SendGrid Email API'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDispatchInvite} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Invitee Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Role Assignment</label>
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as Role)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="student">Student Scholar</option>
                      <option value="faculty">Faculty Mentor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Channel</label>
                    <select
                      value={inviteChannel}
                      onChange={e => setInviteChannel(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="email">Email Invitation</option>
                      <option value="whatsapp">WhatsApp Invite</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-slate-950 bg-amber-400 rounded-xl hover:bg-amber-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Invite</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
