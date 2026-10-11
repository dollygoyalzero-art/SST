import React, { useState } from 'react';
import { TaskLog } from '../../types';
import {
  History, Clock, Calendar, CheckCircle2, AlertTriangle, TrendingUp,
  FileSpreadsheet, Download, Sparkles, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface HistoricalReportsViewProps {
  tasks: TaskLog[];
  onOpenLogModal: () => void;
}

export const HistoricalReportsView: React.FC<HistoricalReportsViewProps> = ({
  tasks, onOpenLogModal
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missed'>('all');

  // Filter tasks based on timeframe
  const now = new Date();
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const diffDays = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

    if (timeframe === 'week' && diffDays > 7) return false;
    if (timeframe === 'month' && diffDays > 30) return false;
    if (timeframe === 'year' && diffDays > 365) return false;

    if (statusFilter !== 'all' && task.status !== statusFilter) return false;

    return true;
  });

  // Calculate totals
  const totalPlannedMins = filteredTasks.reduce((acc, t) => acc + (t.plannedDurationMins || 0), 0);
  const totalActualMins = filteredTasks.reduce((acc, t) => acc + (t.actualDurationMins || 0), 0);
  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
  const missedCount = filteredTasks.filter(t => t.status === 'missed').length;
  const completionRate = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 100;

  // Chart data: By subject
  const subjectBreakdown: { [key: string]: number } = {};
  filteredTasks.forEach(t => {
    const sub = t.subject || 'Other';
    subjectBreakdown[sub] = (subjectBreakdown[sub] || 0) + (t.actualDurationMins / 60);
  });

  const pieData = Object.entries(subjectBreakdown).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(1))
  }));

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];

  // Bar chart by activity
  const barData = filteredTasks.slice(0, 10).map((t, idx) => ({
    name: t.chapter.length > 12 ? t.chapter.slice(0, 12) + '...' : t.chapter,
    planned: t.plannedDurationMins,
    actual: t.actualDurationMins
  }));

  return (
    <div className="space-y-6">
      
      {/* Header & Timeframe Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Historical Task & Performance Reports
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inspect your completed study tasks, actual vs planned durations, and retrospective performance over past timeframes.
            </p>
          </div>

          {/* Timeframe tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 'week'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Past Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 'month'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Past Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 'year'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Past Year
            </button>
          </div>
        </div>

        {/* 4 Performance Metric Cards for Selected Timeframe */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
            <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400">Total Actual Hours</span>
            <p className="text-xl font-black text-indigo-950 dark:text-indigo-200 mt-1">
              {(totalActualMins / 60).toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Planned: {(totalPlannedMins / 60).toFixed(1)} hrs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Completion Rate</span>
            <p className="text-xl font-black text-emerald-950 dark:text-emerald-200 mt-1">
              {completionRate}%
            </p>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">{completedCount} tasks completed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
            <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">Total Sessions</span>
            <p className="text-xl font-black text-purple-950 dark:text-purple-200 mt-1">
              {filteredTasks.length} <span className="text-xs font-normal">logs</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Recorded in {timeframe}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">Missed Sessions</span>
            <p className="text-xl font-black text-rose-950 dark:text-rose-200 mt-1">
              {missedCount} <span className="text-xs font-normal">missed</span>
            </p>
            <span className="text-[10px] text-rose-500 mt-0.5 block">Over {timeframe} period</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics for the Selected Timeframe */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Planned vs Actual Duration Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Planned vs Actual Duration (Minutes)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Tracking time discipline across logged study tasks</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="planned" name="Planned (mins)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual (mins)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Subject Study Hours Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total hours invested by subject in this timeframe</p>
            <div className="h-64 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={entry => `${entry.name}: ${entry.value}h`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">No subject data recorded</p>
              )}
            </div>
          </div>

        </div>
      ) : null}

      {/* Detailed Historical Task Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Task Log Audit Trail ({filteredTasks.length} Entries)
            </h3>
            <p className="text-xs text-slate-500">Every activity logged by date, duration, and status</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex space-x-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'completed' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('missed')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'missed' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Missed
              </button>
            </div>

            <button
              onClick={onOpenLogModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition"
            >
              + Log New Activity
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs space-y-2">
            <Calendar className="w-8 h-8 mx-auto opacity-40" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No activity logs found for this timeframe</p>
            <p className="text-[11px] text-slate-400">Click '+ Log New Activity' to record your first study or problem-solving session.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map(task => (
              <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{task.date}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{task.subject}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{task.chapter}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{task.taskDescription}</p>
                  {task.facultyComment && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 italic">
                      Mentor note: "{task.facultyComment}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4 font-mono text-[11px] self-end sm:self-center">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Planned</span>
                    <strong>{task.plannedDurationMins}m</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Actual</span>
                    <strong className={task.actualDurationMins >= task.plannedDurationMins ? 'text-emerald-600' : 'text-amber-600'}>
                      {task.actualDurationMins}m
                    </strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-sans ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    task.status === 'missed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
