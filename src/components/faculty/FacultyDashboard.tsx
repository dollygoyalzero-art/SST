import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck, Users, Flame, Clock, Target, AlertTriangle, CheckCircle2,
  MessageSquare, UserPlus, Shield, ChevronRight, Check, X, Sparkles, Send
} from 'lucide-react';
import { User, StudySlot, WeeklyTarget, TaskLog } from '../../types';

export const FacultyDashboard: React.FC = () => {
  const {
    currentUser, users, updateUsers, slots, weeklyTargets, updateWeeklyTargets,
    tasks, updateTasks, addNotification
  } = useAuth();

  const faculty = (currentUser && currentUser.role === 'faculty')
    ? currentUser
    : (users.find(u => u.role === 'faculty') || {
        id: 'faculty_default',
        name: 'Faculty Educator',
        email: 'faculty@example.com',
        role: 'faculty' as const,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().split('T')[0],
        streak: 0,
        totalStudyHours: 0,
        attendanceRate: 100,
        status: 'active' as const
      });

  // Find assigned mentees (or students linked to this faculty)
  const assignedMentees = users.filter(u => u.role === 'student' && u.assignedFacultyId === faculty.id);
  // Find unassigned students (students without any faculty mentor)
  const unassignedStudents = users.filter(u => u.role === 'student' && !u.assignedFacultyId);

  const [selectedStudent, setSelectedStudent] = useState<User | null>(assignedMentees[0] || null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'motivational' | 'task_critique' | 'improvement_plan'>('motivational');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Claim unassigned student handler
  const handleClaimStudent = (studentId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === studentId) {
        return { ...u, assignedFacultyId: faculty.id };
      }
      return u;
    });
    updateUsers(updatedUsers);

    const claimed = users.find(u => u.id === studentId);
    if (claimed) {
      addNotification({
        userId: studentId,
        type: 'faculty_feedback',
        channel: 'whatsapp',
        title: 'New Mentor Assigned',
        message: `${faculty.name} has claimed you as their academic mentee! Reach out for weekly schedule reviews.`,
        status: 'delivered'
      });
      setSelectedStudent({ ...claimed, assignedFacultyId: faculty.id });
    }
  };

  // Approve or comment on student weekly target
  const handleApproveTarget = (targetId: string, approve: boolean) => {
    const updated = weeklyTargets.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          facultyApproved: approve,
          facultyNotes: approve ? `Approved by ${faculty.name} on ${new Date().toLocaleDateString()}` : 'Please revise problem selection'
        };
      }
      return t;
    });
    updateWeeklyTargets(updated);

    if (selectedStudent) {
      addNotification({
        userId: selectedStudent.id,
        type: 'target_alert',
        channel: 'in_app',
        title: approve ? 'Target Approved by Mentor' : 'Target Feedback',
        message: `${faculty.name} has ${approve ? 'approved' : 'reviewed'} your weekly target.`,
        status: 'delivered'
      });
    }
  };

  // Send feedback comment
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedStudent) return;

    // Attach comment to latest student task
    const studentTasks = tasks.filter(t => t.studentId === selectedStudent.id);
    if (studentTasks.length > 0) {
      const updatedTasks = tasks.map(t => {
        if (t.id === studentTasks[0].id) {
          return { ...t, facultyComment: feedbackText.trim() };
        }
        return t;
      });
      updateTasks(updatedTasks);
    }

    addNotification({
      userId: selectedStudent.id,
      type: 'faculty_feedback',
      channel: 'whatsapp',
      title: `Mentor Feedback from ${faculty.name}`,
      message: feedbackText.trim(),
      status: 'delivered'
    });

    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  // Inspect selected student records
  const studentSlots = selectedStudent ? slots.filter(s => s.studentId === selectedStudent.id) : [];
  const studentTargets = selectedStudent ? weeklyTargets.filter(t => t.studentId === selectedStudent.id) : [];
  const missedSlotsCount = studentSlots.filter(s => s.status === 'missed').length;

  return (
    <div className="space-y-6">
      
      {/* Faculty Profile Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={faculty.avatar}
              alt={faculty.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {faculty.name}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Senior Faculty Mentor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Department of Physics & Entrance Mentorship • Meecademia Senior Faculty
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned Mentees</span>
              <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {assignedMentees.length}
              </strong>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-center border border-amber-200 dark:border-amber-900/40">
              <span className="text-amber-700 dark:text-amber-400 block text-[10px] font-bold uppercase">Awaiting Mentor</span>
              <strong className="text-lg font-black text-amber-600 dark:text-amber-400">
                {unassignedStudents.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Unassigned Students Pool (Faculty Claiming Feature) */}
      {unassignedStudents.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Unassigned Scholars Awaiting Academic Mentors
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Faculty can claim students for mentorship monitoring (students cannot choose their mentors).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unassignedStudents.map(student => (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-amber-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <img src={student.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{student.name}</h4>
                    <p className="text-[10px] text-slate-500">{student.batch || 'Apex JEE 2027'}</p>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      Streak: {student.streak}d • {student.totalStudyHours}h logged
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaimStudent(student.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                >
                  Claim Mentee
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Faculty Mentee Inspection & Feedback Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assigned Mentees List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Assigned Mentees ({assignedMentees.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Click to inspect</span>
          </div>

          <div className="space-y-2">
            {assignedMentees.map(mentee => {
              const isSelected = selectedStudent?.id === mentee.id;
              const menteeMissed = slots.filter(s => s.studentId === mentee.id && s.status === 'missed').length;

              return (
                <div
                  key={mentee.id}
                  onClick={() => setSelectedStudent(mentee)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={mentee.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {mentee.name}
                        </h4>
                        {menteeMissed > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {menteeMissed} missed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{mentee.batch}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                        <span>Streak: <strong className="text-amber-500">{mentee.streak}d</strong></span>
                        <span>Hours: <strong className="text-indigo-500">{mentee.totalStudyHours}h</strong></span>
                        <span>Att: <strong className="text-emerald-500">{mentee.attendanceRate}%</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 spans): Deep Mentee Inspection & Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <>
              {/* Mentee Health Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <img src={selectedStudent.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedStudent.email} • {selectedStudent.targetExam}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Attendance: {selectedStudent.attendanceRate}%
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Streak: {selectedStudent.streak} days
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-3 gap-3 my-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Study Hours</span>
                    <strong className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {selectedStudent.totalStudyHours} hrs
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Active Targets</span>
                    <strong className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                      {studentTargets.length} Targets
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Missed Slots</span>
                    <strong className={`text-base font-extrabold ${missedSlotsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {missedSlotsCount} Missed
                    </strong>
                  </div>
                </div>

                {/* Mentee Daily Slots Preview */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                    Today's Scheduled Slots & Real-Time Status:
                  </h4>
                  <div className="space-y-2">
                    {studentSlots.map(slot => (
                      <div
                        key={slot.id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                            {slot.startTime}-{slot.endTime}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{slot.subject}:</span>
                          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{slot.chapter} - {slot.topic}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          slot.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          slot.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          slot.status === 'missed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {slot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Approvals & Sign-Offs */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Target Review & Faculty Approval:
                </h4>
                <div className="space-y-3">
                  {studentTargets.map(target => (
                    <div
                      key={target.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                          {target.subject} • {target.chapter}
                        </span>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100">{target.targetMetric}</h5>
                        <p className="text-[11px] text-slate-500">
                          Progress: {target.completedCount} / {target.assignedCount} {target.unit} ({Math.round((target.completedCount / target.assignedCount) * 100)}%)
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {target.facultyApproved ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved by You</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveTarget(target.id, true)}
                            className="px-3 py-1.5 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve Target</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentorship Feedback Dispatch Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Send Direct Mentor Guidance to {selectedStudent.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">Dispatches via In-App notice & WhatsApp Business API</p>
                  </div>
                </div>

                <form onSubmit={handleSendFeedback} className="space-y-3">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackType('motivational')}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                        feedbackType === 'motivational' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Motivational Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('task_critique')}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                        feedbackType === 'task_critique' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Missed Task Critique
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('improvement_plan')}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                        feedbackType === 'improvement_plan' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Recovery Plan
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder={`e.g. Great pace on HC Verma problems! However, make sure to recover your missed integration session before Friday's full mock test.`}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {feedbackSent ? 'Feedback delivered to student WhatsApp!' : 'Immediate push notification'}
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Mentor Feedback</span>
                    </button>
                  </div>
                </form>
              </div>

            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>Select a mentee from the left list to review their study schedule and provide feedback.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
