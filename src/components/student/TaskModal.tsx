import React, { useState } from 'react';
import { TaskLog } from '../../types';
import { X, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { SUBJECTS_LIST } from '../../data/mockData';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskLog, 'id'>) => void;
  studentId: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, studentId }) => {
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [plannedDurationMins, setPlannedDurationMins] = useState(90);
  const [actualDurationMins, setActualDurationMins] = useState(85);
  const [status, setStatus] = useState<'completed' | 'pending' | 'missed'>('completed');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter.trim() || !taskDescription.trim()) return;

    onSave({
      studentId,
      date: new Date().toISOString().split('T')[0],
      subject,
      chapter: chapter.trim(),
      taskDescription: taskDescription.trim(),
      plannedDurationMins: Number(plannedDurationMins),
      actualDurationMins: Number(actualDurationMins),
      status,
      completedAt: status === 'completed' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Log Study Activity</h2>
              <p className="text-xs text-slate-500">Record planned vs actual duration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            >
              {SUBJECTS_LIST.map(sub => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Chapter
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Thermodynamics, Complex Numbers"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Details / Problems Solved
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Completed HCV Chapter 10 exercises 1 to 30 with notes"
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Planned (mins)</span>
              </label>
              <input
                type="number"
                min={10}
                max={480}
                value={plannedDurationMins}
                onChange={e => setPlannedDurationMins(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Actual (mins)</span>
              </label>
              <input
                type="number"
                min={0}
                max={480}
                value={actualDurationMins}
                onChange={e => setActualDurationMins(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Session Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  status === 'pending'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setStatus('missed')}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  status === 'missed'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Missed
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              Save Activity Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
