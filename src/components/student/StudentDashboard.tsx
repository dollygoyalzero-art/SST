import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Flame, Clock, CheckCircle2, AlertCircle, Calendar, Plus, Target,
  TrendingUp, BookOpen, Bell, ArrowUpRight, Check, X, Award, ChevronRight,
  Filter, Play, Sparkles, History, Compass, Moon, Sun
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Legend, PieChart, Pie, Cell
} from 'recharts';
import { SlotModal } from './SlotModal';
import { TargetModal } from './TargetModal';
import { TaskModal } from './TaskModal';
import { ReminderConfigModal } from './ReminderConfigModal';
import { AIStudyCoach } from './AIStudyCoach';
import { SearchStudyExplorer } from './SearchStudyExplorer';
import { LeaderboardView } from './LeaderboardView';
import { SevenDayScheduleCanvas } from './SevenDayScheduleCanvas';
import { HistoricalReportsView } from './HistoricalReportsView';
import { StudySlot, WeeklyTarget, MonthlyTarget, TaskLog, SlotStatus } from '../../types';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser, slots, updateSlots, weeklyTargets, updateWeeklyTargets,
    monthlyTargets, updateMonthlyTargets, tasks, updateTasks, addNotification,
    isDarkMode, toggleDarkMode
  } = useAuth();

  // If no user is logged in, default guest / newly registered identity
  const student = currentUser || {
    id: 'guest_student',
    name: 'Scholar',
    email: 'scholar@example.com',
    role: 'student' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    batch: 'Foundation Batch',
    targetExam: 'JEE Advanced' as const,
    streak: 0,
    totalStudyHours: 0,
    attendanceRate: 100,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active' as const
  };

  // Filter student-specific records
  const studentSlots = slots.filter(s => s.studentId === student.id);
  const studentWeeklyTargets = weeklyTargets.filter(t => t.studentId === student.id);
  const studentMonthlyTargets = monthlyTargets.filter(t => t.studentId === student.id);
  const studentTasks = tasks.filter(t => t.studentId === student.id);

  // Sub-tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'seven_day_canvas' | 'targets' | 'history' | 'leaderboard' | 'explorer'>('overview');

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [targetSlotDay, setTargetSlotDay] = useState<number | undefined>(undefined);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Derived metrics
  const completedSlots = studentSlots.filter(s => s.status === 'completed').length;
  const pendingSlots = studentSlots.filter(s => s.status === 'pending' || s.status === 'in_progress').length;
  const missedSlots = studentSlots.filter(s => s.status === 'missed').length;

  // Calculate actual hours logged from tasks or completed study slots
  const calculatedHours = studentTasks.length > 0
    ? Number((studentTasks.reduce((acc, t) => acc + (t.actualDurationMins || 0), 0) / 60).toFixed(1))
    : student.totalStudyHours;

  // Chart Data: Real or dynamically compiled from actual student tasks
  const subjectHoursMap: { [key: string]: number } = {
    Physics: 0,
    Chemistry: 0,
    Mathematics: 0,
    Biology: 0
  };

  studentSlots.forEach(s => {
    if (s.subject && subjectHoursMap[s.subject] !== undefined) {
      subjectHoursMap[s.subject] += 1.5;
    }
  });

  const subjectHoursData = Object.entries(subjectHoursMap).map(([subject, completed]) => ({
    subject,
    completed,
    target: completed > 0 ? completed + 3 : 10
  }));

  // Consistency trend data
  const consistencyTrendData = [
    { day: 'Day 1', hours: 3.5 },
    { day: 'Day 2', hours: 4.0 },
    { day: 'Day 3', hours: 5.0 },
    { day: 'Day 4', hours: calculatedHours > 0 ? calculatedHours : 4.5 }
  ];

  // Status toggle handler for slots
  const handleSlotStatusToggle = (slotId: string, newStatus: SlotStatus) => {
    const updated = slots.map(s => {
      if (s.id === slotId) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    updateSlots(updated);

    if (newStatus === 'completed') {
      addNotification({
        userId: student.id,
        type: 'target_alert',
        channel: 'in_app',
        title: 'Canvas Block Completed',
        message: 'Great discipline! Slot marked as completed.',
        status: 'delivered'
      });
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    const updated = slots.filter(s => s.id !== slotId);
    updateSlots(updated);
  };

  // Add new Slot (Study or Routine)
  const handleSaveSlot = (slotData: Omit<StudySlot, 'id'>) => {
    const newSlot: StudySlot = {
      ...slotData,
      id: `slot_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
    updateSlots([newSlot, ...slots]);
    addNotification({
      userId: student.id,
      type: 'custom',
      channel: 'whatsapp',
      title: 'Canvas Block Scheduled',
      message: `${slotData.category === 'study' ? slotData.subject : slotData.title} scheduled for ${slotData.startTime}-${slotData.endTime}.`,
      status: 'scheduled'
    });
  };

  // Optional: Load sample starting routine template if clean user wants a foundation
  const handleLoadFoundationTemplate = () => {
    const templateSlots: StudySlot[] = [
      {
        id: `tpl_1_${Date.now()}`,
        studentId: student.id,
        category: 'routine',
        title: 'Morning Routine & Breakfast',
        startTime: '06:00',
        endTime: '07:00',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'daily',
        priority: 'medium',
        status: 'completed'
      },
      {
        id: `tpl_2_${Date.now()}`,
        studentId: student.id,
        category: 'school',
        title: 'School / Academic Classes',
        startTime: '07:30',
        endTime: '14:30',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'weekdays',
        priority: 'high',
        status: 'completed'
      },
      {
        id: `tpl_3_${Date.now()}`,
        studentId: student.id,
        category: 'study',
        subject: 'Physics',
        chapter: 'Rotational Motion',
        topic: 'Torque equations and angular momentum conservation',
        startTime: '16:00',
        endTime: '17:45',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'weekdays',
        priority: 'high',
        status: 'pending'
      },
      {
        id: `tpl_4_${Date.now()}`,
        studentId: student.id,
        category: 'exercise',
        title: 'Physical Workout / Sports',
        startTime: '18:00',
        endTime: '19:00',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'daily',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: `tpl_5_${Date.now()}`,
        studentId: student.id,
        category: 'study',
        subject: 'Mathematics',
        chapter: 'Integral Calculus',
        topic: 'Definite integrals - Leibniz rule & reduction formulae',
        startTime: '19:30',
        endTime: '21:30',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'weekdays',
        priority: 'high',
        status: 'pending'
      },
      {
        id: `tpl_6_${Date.now()}`,
        studentId: student.id,
        category: 'sleep',
        title: 'Sleep & Night Recovery',
        startTime: '23:00',
        endTime: '06:00',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'daily',
        priority: 'medium',
        status: 'pending'
      }
    ];

    updateSlots([...templateSlots, ...slots]);
    addNotification({
      userId: student.id,
      type: 'faculty_feedback',
      channel: 'in_app',
      title: 'Foundation Routine Applied',
      message: 'Balanced 24-hour schedule loaded into your 7-day canvas. Customize it anytime!',
      status: 'delivered'
    });
  };

  // Add Targets
  const handleSaveWeeklyTarget = (targetData: Omit<WeeklyTarget, 'id'>) => {
    const newTarget: WeeklyTarget = {
      ...targetData,
      id: `wt_${Date.now()}`
    };
    updateWeeklyTargets([newTarget, ...weeklyTargets]);
  };

  const handleSaveMonthlyTarget = (targetData: Omit<MonthlyTarget, 'id'>) => {
    const newTarget: MonthlyTarget = {
      ...targetData,
      id: `mt_${Date.now()}`
    };
    updateMonthlyTargets([newTarget, ...monthlyTargets]);
  };

  // Add Task Log
  const handleSaveTask = (taskData: Omit<TaskLog, 'id'>) => {
    const newTask: TaskLog = {
      ...taskData,
      id: `task_${Date.now()}`
    };
    updateTasks([newTask, ...tasks]);
  };

  // Target count progress increment
  const handleTargetIncrement = (targetId: string, delta: number) => {
    const updated = weeklyTargets.map(t => {
      if (t.id === targetId) {
        const nextCount = Math.min(t.assignedCount, Math.max(0, t.completedCount + delta));
        return {
          ...t,
          completedCount: nextCount,
          status: (nextCount >= t.assignedCount ? 'completed' : 'in_progress') as any
        };
      }
      return t;
    });
    updateWeeklyTargets(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Scholar Identity & KPI Hero Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Profile Identity */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow">
                ★
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {student.name}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {student.targetExam || 'JEE Advanced'}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {student.batch || 'General Batch'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Meccademia Scholar Workspace • {student.email}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTargetSlotDay(undefined);
                setIsSlotModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Canvas Slot</span>
            </button>
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Target className="w-4 h-4 text-purple-500" />
              <span>Set Target</span>
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Log Task</span>
            </button>
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Reminder Preferences (Email / WhatsApp)"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 Core Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Streak</span>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-300 mt-2 flex items-center space-x-1">
              <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
              <span>{student.streak} <span className="text-xs font-normal">days</span></span>
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">Active Habit Streak</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">Study Hours</span>
            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-300 mt-2">
              {calculatedHours} <span className="text-xs font-normal">hrs</span>
            </p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 block">Tracked on Meccademia</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">Weekly Targets</span>
            <p className="text-2xl font-black text-purple-900 dark:text-purple-300 mt-2">
              {studentWeeklyTargets.length} <span className="text-xs font-normal">goals</span>
            </p>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block">
              {studentWeeklyTargets.filter(t => t.status === 'completed').length} completed
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Attendance</span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-2">
              {student.attendanceRate}%
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">Session Discipline</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Canvas Blocks</span>
            <p className="text-2xl font-black text-blue-900 dark:text-blue-300 mt-2">
              {studentSlots.length} <span className="text-xs font-normal">slots</span>
            </p>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 block">
              {completedSlots} Done / {pendingSlots} Pending
            </span>
          </div>

        </div>
      </div>

      {/* 2. AI Study Coach & TTS Audio Player */}
      <AIStudyCoach
        studentName={student.name}
        targetExam={student.targetExam || 'JEE Advanced'}
        slots={studentSlots}
        studyHours={calculatedHours}
      />

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overview & Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('seven_day_canvas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'seven_day_canvas'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>7-Day Canvas Planner ({studentSlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('targets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'targets'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Weekly & Monthly Targets ({studentWeeklyTargets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historical Reports & Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Leaderboard & Badges</span>
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'explorer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-500" />
          <span>Exam Explorer (Google Grounded)</span>
        </button>
      </div>

      {/* 4. Tab Views */}

      {/* OVERVIEW TAB: Recharts Visualizations & Today Preview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Subject-wise Study Hours vs Target (Bar Chart) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Subject-Wise Study Hours vs Target
                  </h3>
                  <p className="text-xs text-slate-500">Tracked hours vs syllabus benchmarks</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="completed" name="Tracked Hours" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="target" name="Target Quota" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Consistency Trend (Area Chart) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Study Hours Velocity
                  </h3>
                  <p className="text-xs text-slate-500">Daily logged velocity and focus momentum</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consistencyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="hours" name="Study Hours" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Quick 7-Day Canvas Overview Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Active Canvas Blocks ({studentSlots.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('seven_day_canvas')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>Open 7-Day Weekly Canvas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {studentSlots.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-300">No schedule blocks added yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click 'Open 7-Day Weekly Canvas' or '+ Add Canvas Slot' above to map out your week.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {studentSlots.slice(0, 6).map(slot => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400">{slot.startTime}-{slot.endTime}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {slot.category === 'study' ? slot.subject : slot.category}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {slot.category === 'study' ? slot.chapter : slot.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7-DAY CANVAS TAB */}
      {activeTab === 'seven_day_canvas' && (
        <SevenDayScheduleCanvas
          slots={studentSlots}
          onAddSlot={(dayIndex) => {
            setTargetSlotDay(dayIndex);
            setIsSlotModalOpen(true);
          }}
          onUpdateStatus={handleSlotStatusToggle}
          onDeleteSlot={handleDeleteSlot}
          onApplyTemplate={handleLoadFoundationTemplate}
        />
      )}

      {/* TARGETS TAB */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Weekly Practice Quotas ({studentWeeklyTargets.length})
                </h3>
                <p className="text-xs text-slate-500">Track questions solved, chapter coverage, and faculty sign-offs</p>
              </div>
              <button
                onClick={() => setIsTargetModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Set Target</span>
              </button>
            </div>

            {studentWeeklyTargets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No active weekly targets yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click '+ Set Target' to establish your weekly question solving quota.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentWeeklyTargets.map(target => {
                  const percent = Math.round((target.completedCount / target.assignedCount) * 100);
                  const remaining = Math.max(0, target.assignedCount - target.completedCount);

                  return (
                    <div key={target.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            {target.subject} • {target.chapter}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {target.targetMetric}
                          </h4>
                        </div>
                        {target.facultyApproved && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Mentor Approved
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent >= 100 ? 'bg-emerald-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Completed: <strong className="text-slate-900 dark:text-slate-100">{target.completedCount}</strong> / {target.assignedCount} {target.unit}
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {percent}% ({remaining} remaining)
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 italic">Log progress:</span>
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleTargetIncrement(target.id, 5)}
                            className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 font-semibold"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleTargetIncrement(target.id, 10)}
                            className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 font-semibold"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORICAL REPORTS TAB */}
      {activeTab === 'history' && (
        <HistoricalReportsView
          tasks={studentTasks}
          onOpenLogModal={() => setIsTaskModalOpen(true)}
        />
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <LeaderboardView />
      )}

      {/* EXAM EXPLORER TAB */}
      {activeTab === 'explorer' && (
        <SearchStudyExplorer targetExam={student.targetExam || 'JEE Advanced'} />
      )}

      {/* Modals */}
      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        onSave={handleSaveSlot}
        studentId={student.id}
        initialDay={targetSlotDay}
      />

      <TargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSaveWeekly={handleSaveWeeklyTarget}
        onSaveMonthly={handleSaveMonthlyTarget}
        studentId={student.id}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        studentId={student.id}
      />

      <ReminderConfigModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSendTestNotification={(channel, time) => {
          addNotification({
            userId: student.id,
            type: '10_min',
            channel,
            title: `Study Reminder (${time} prior)`,
            message: `Your scheduled canvas block starts in ${time}.`,
            status: 'delivered'
          });
        }}
      />

    </div>
  );
};
