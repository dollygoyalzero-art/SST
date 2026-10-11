import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, Users, UserPlus, Mail, Edit3, Trash2, CheckCircle2,
  Search, Filter, Link as LinkIcon, RefreshCw, Send, AlertCircle, X
} from 'lucide-react';
import { User, Role } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { users, updateUsers, addNotification } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  // User CRUD - Add
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
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
    setIsAddUserModalOpen(false);
    setNewName('');
    setNewEmail('');
  };

  // User CRUD - Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    updateUsers(updated);
    setEditingUser(null);
  };

  // User CRUD - Delete
  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user from Meccademia database?')) {
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

    const invitedUser: User = {
      id: `invite_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
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
              <p className="text-xs text-slate-400 mt-1">
                Real-time user directory, faculty mentorship matrix & invite provisioning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invitation</span>
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
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Study Hours</span>
            <strong className="text-xl font-black text-amber-400 mt-1 block">118.4 hrs</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Attendance</span>
            <strong className="text-xl font-black text-purple-400 mt-1 block">93.2%</strong>
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
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  roleFilter === 'student' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Students ({studentMembers.length})
              </button>
              <button
                onClick={() => setRoleFilter('faculty')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  roleFilter === 'faculty' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Faculty ({facultyMembers.length})
              </button>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Batch / Target Exam</th>
                <th className="py-3 px-4">Assigned Mentor</th>
                <th className="py-3 px-4 text-center">Streak / Hours</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredUsers.map(user => {
                const assignedMentor = facultyMembers.find(f => f.id === user.assignedFacultyId);

                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        user.role === 'admin' ? 'bg-slate-800 text-white' :
                        user.role === 'faculty' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {user.batch || (user.role === 'faculty' ? 'Faculty Department' : 'Central Admin')}
                    </td>

                    {/* Mentorship Assignment Column */}
                    <td className="py-3 px-4">
                      {user.role === 'student' ? (
                        <select
                          value={user.assignedFacultyId || ''}
                          onChange={e => handleReassignMentor(user.id, e.target.value)}
                          className="text-[11px] p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                          <option value="">-- No Mentor Assigned --</option>
                          {facultyMembers.map(fac => (
                            <option key={fac.id} value={fac.id}>
                              {fac.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {user.role === 'student' ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {user.streak}d • {user.totalStudyHours}h
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {user.role !== 'admin' && (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add New User</h3>
              <button onClick={() => setIsAddUserModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Kushal Singhania"
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
                  placeholder="student@meecademia.edu"
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
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {newRole === 'student' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Assigned Batch</label>
                    <input
                      type="text"
                      value={newBatch}
                      onChange={e => setNewBatch(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Target Exam</label>
                    <select
                      value={newTargetExam}
                      onChange={e => setNewTargetExam(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="JEE Advanced">JEE Advanced</option>
                      <option value="JEE Main">JEE Main</option>
                      <option value="NEET">NEET (Medical)</option>
                      <option value="CBSE Boards">CBSE Boards</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Edit User Details</h3>
              <button onClick={() => setEditingUser(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Name</label>
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
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
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
              <button onClick={() => setIsInviteModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
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
                    placeholder="candidate@meecademia.edu"
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
                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-slate-950 bg-amber-400 rounded-xl hover:bg-amber-300 flex items-center space-x-1"
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
