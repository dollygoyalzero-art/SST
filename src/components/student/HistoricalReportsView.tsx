import React, { useState } from 'react';
import { TaskLog, StudySlot } from '../../types';
import {
  History, Clock, Calendar, CheckCircle2, AlertTriangle, TrendingUp,
  FileSpreadsheet, Download, Sparkles, Filter, BookOpen, MessageCircle,
  CheckCheck, ArrowUpDown, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface HistoricalReportsViewProps {
  tasks: TaskLog[];
  slots: StudySlot[];
  onOpenLogModal: () => void;
}

export const HistoricalReportsView: React.FC<HistoricalReportsViewProps> = ({
  tasks, slots, onOpenLogModal
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [contentType, setContentType] = useState<'all' | 'schedules' | 'tasks'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const now = new Date();

  // Helper date difference
  const isWithinTimeframe = (dateString: string) => {
    if (timeframe === 'all') return true;
    const itemDate = new Date(dateString);
    if (isNaN(itemDate.getTime())) return true; // If recurring or current without fixed date
    const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
    if (timeframe === 'week') return diffDays <= 7 && diffDays >= 0;
    if (timeframe === 'month') return diffDays <= 30 && diffDays >= 0;
    return true;
  };

  // 1. Filtered Completed Slots / Schedules
  const completedSlots = slots.filter(slot => {
    if (slot.status !== 'completed') return false;
    if (!isWithinTimeframe(slot.date)) return false;
    if (subjectFilter !== 'all' && slot.subject !== subjectFilter) return false;
    return true;
  });

  // 2. Filtered Completed Tasks
  const completedTasks = tasks.filter(task => {
    if (task.status !== 'completed') return false;
    if (!isWithinTimeframe(task.date)) return false;
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
    return true;
  });

  // Calculate totals
  const totalSlotsHours = Number((completedSlots.reduce((acc, s) => {
    const [startH, startM] = s.startTime.split(':').map(Number);
    const [endH, endM] = s.endTime.split(':').map(Number);
    const mins = (endH * 60 + endM) - (startH * 60 + startM);
    return acc + (mins > 0 ? mins : 60);
  }, 0) / 60).toFixed(1));

  const totalTaskHours = Number((completedTasks.reduce((acc, t) => acc + (t.actualDurationMins || 0), 0) / 60).toFixed(1));
  const combinedStudyHours = (totalSlotsHours + totalTaskHours).toFixed(1);

  const totalMentorComments = completedSlots.reduce((acc, s) => acc + (s.comments?.length || 0), 0) +
    completedTasks.filter(t => t.facultyComment).length;

  // Chart data: By subject
  const subjectBreakdown: { [key: string]: number } = {};
  completedSlots.forEach(s => {
    const sub = s.subject || 'Routine';
    subjectBreakdown[sub] = (subjectBreakdown[sub] || 0) + 1.5;
  });
  completedTasks.forEach(t => {
    const sub = t.subject || 'General';
    subjectBreakdown[sub] = (subjectBreakdown[sub] || 0) + (t.actualDurationMins / 60);
  });

  const pieData = Object.entries(subjectBreakdown).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(1))
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Bar chart: Completed tasks planned vs actual
  const barData = completedTasks.slice(0, 8).map(t => ({
    name: t.chapter.length > 10 ? t.chapter.slice(0, 10) + '...' : t.chapter,
    planned: t.plannedDurationMins,
    actual: t.actualDurationMins
  }));

  const handleExportCSV = () => {
    let csv = "Type,Date,Subject,Title/Chapter,Duration/Time,Status,MentorFeedback\n";
    completedSlots.forEach(s => {
      csv += `Schedule,${s.date || 'Weekly'},"${s.subject || 'Routine'}","${s.chapter || s.title || ''}","${s.startTime}-${s.endTime}",Completed,"${s.comments?.map(c => c.comment).join('; ') || 'None'}"\n`;
    });
    completedTasks.forEach(t => {
      csv += `Task,${t.date},"${t.subject}","${t.chapter}","${t.actualDurationMins} mins",Completed,"${t.facultyComment || 'None'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Meccademia_Completed_History_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Completed Schedules & Tasks History
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audit log of everything you completed during the Past Week and Past Month, including mentor comments.
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === 'week'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Past Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === 'month'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Past Month
              </button>
              <button
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === 'all'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Time
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
            <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400">Total Study Hours</span>
            <p className="text-xl font-black text-indigo-950 dark:text-indigo-200 mt-1">
              {combinedStudyHours} <span className="text-xs font-normal">hrs</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Logged in {timeframe === 'week' ? 'past 7 days' : timeframe === 'month' ? 'past 30 days' : 'all sessions'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Completed Schedules</span>
            <p className="text-xl font-black text-emerald-950 dark:text-emerald-200 mt-1">
              {completedSlots.length} <span className="text-xs font-normal">slots</span>
            </p>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">100% adherence</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
            <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">Completed Tasks</span>
            <p className="text-xl font-black text-purple-950 dark:text-purple-200 mt-1">
              {completedTasks.length} <span className="text-xs font-normal">tasks</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Problems & review logs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Mentor Notes Received</span>
            <p className="text-xl font-black text-amber-950 dark:text-amber-200 mt-1">
              {totalMentorComments} <span className="text-xs font-normal">comments</span>
            </p>
            <span className="text-[10px] text-amber-600 mt-0.5 block">Faculty feedback saved</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      {(completedSlots.length > 0 || completedTasks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart: Subject Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Completed Subject Distribution ({timeframe === 'week' ? 'Past Week' : 'Past Month'})
            </h3>
            <p className="text-xs text-slate-500 mb-4">Study hours distribution across subjects in this timeframe</p>
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
                <p className="text-xs text-slate-400">No subject data recorded for this timeframe</p>
              )}
            </div>
          </div>

          {/* Bar Chart: Task Durations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Completed Task Planned vs Actual Minutes
            </h3>
            <p className="text-xs text-slate-500 mb-4">Adherence to planned session durations</p>
            <div className="h-64 w-full">
              {barData.length > 0 ? (
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
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Log your study tasks with the '+ Log Activity' button to compare planned vs actual durations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Type Category Toggle (All vs Completed Schedules vs Completed Tasks) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
          <button
            onClick={() => setContentType('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              contentType === 'all'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            All Completed Items ({completedSlots.length + completedTasks.length})
          </button>
          <button
            onClick={() => setContentType('schedules')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              contentType === 'schedules'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Completed Schedules & Slots ({completedSlots.length})
          </button>
          <button
            onClick={() => setContentType('tasks')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              contentType === 'tasks'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Completed Tasks ({completedTasks.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          >
            <option value="all">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
          </select>

          <button
            onClick={onOpenLogModal}
            className="px-3 py-1.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition cursor-pointer"
          >
            + Log Activity
          </button>
        </div>
      </div>

      {/* 1. COMPLETED SCHEDULES & SLOTS AUDIT LIST */}
      {(contentType === 'all' || contentType === 'schedules') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Completed Schedule Slots ({completedSlots.length} in {timeframe === 'week' ? 'Past Week' : 'Past Month'})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Verified Study & Routine Slots</span>
          </div>

          {completedSlots.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No completed schedule slots recorded for this {timeframe === 'week' ? 'past week' : 'past month'}. Mark your slots as "completed" in the Schedule Canvas as you finish them!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {completedSlots.map(slot => (
                <div key={slot.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {slot.subject || slot.title}
                      </span>
                      {slot.chapter && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{slot.chapter}</span>
                        </>
                      )}
                      {slot.topic && (
                        <span className="text-slate-500 text-[11px]">({slot.topic})</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>Priority: <strong className="capitalize">{slot.priority}</strong></span>
                      <span>•</span>
                      <span>Recurrence: <strong className="capitalize">{slot.recurrence}</strong></span>
                      {slot.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-600 dark:text-slate-400">"{slot.notes}"</span>
                        </>
                      )}
                    </div>

                    {/* Mentor Comments if any */}
                    {slot.comments && slot.comments.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-500 space-y-1">
                        {slot.comments.map(c => (
                          <div key={c.id} className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg">
                            <span className="font-bold">{c.facultyName}: </span>
                            <span>"{c.comment}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-1">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. COMPLETED TASKS AUDIT LIST */}
      {(contentType === 'all' || contentType === 'tasks') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Completed Study Tasks ({completedTasks.length} in {timeframe === 'week' ? 'Past Week' : 'Past Month'})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Planned vs Actual Duration Audit</span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No completed study tasks logged for this timeframe. Use the "+ Log Activity" button above to record your completed chapters and practice question sessions.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {completedTasks.map(task => (
                <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-[10px] text-slate-400">{task.date}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{task.subject}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{task.chapter}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{task.taskDescription}</p>

                    {task.facultyComment && (
                      <div className="mt-1.5 pl-2 border-l-2 border-amber-500 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-1.5 rounded">
                        <span className="font-bold">Mentor Feedback: </span>
                        <span>"{task.facultyComment}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 font-mono text-[11px] self-end sm:self-center">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Planned</span>
                      <strong>{task.plannedDurationMins}m</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Actual</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {task.actualDurationMins}m
                      </strong>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-sans bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
