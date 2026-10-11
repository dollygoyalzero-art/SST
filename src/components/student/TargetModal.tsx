import React, { useState } from 'react';
import { WeeklyTarget, MonthlyTarget } from '../../types';
import { X, Target, Calendar, Award } from 'lucide-react';
import { SUBJECTS_LIST } from '../../data/mockData';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWeekly: (target: Omit<WeeklyTarget, 'id'>) => void;
  onSaveMonthly: (target: Omit<MonthlyTarget, 'id'>) => void;
  studentId: string;
}

export const TargetModal: React.FC<TargetModalProps> = ({
  isOpen, onClose, onSaveWeekly, onSaveMonthly, studentId
}) => {
  const [targetType, setTargetType] = useState<'weekly' | 'monthly'>('weekly');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [metricDescription, setMetricDescription] = useState('');
  const [assignedCount, setAssignedCount] = useState<number>(50);
  const [unit, setUnit] = useState('questions');

  // Monthly fields
  const [monthlyTitle, setMonthlyTitle] = useState('');
  const [monthlyDesc, setMonthlyDesc] = useState('');
  const [targetScore, setTargetScore] = useState<number>(85);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType === 'weekly') {
      if (!chapter.trim() || !metricDescription.trim()) return;
      onSaveWeekly({
        studentId,
        subject,
        chapter: chapter.trim(),
        targetMetric: metricDescription.trim(),
        assignedCount: Number(assignedCount),
        completedCount: 0,
        unit,
        weekNumber: 41,
        year: 2026,
        status: 'in_progress',
        facultyApproved: false
      });
    } else {
      if (!monthlyTitle.trim()) return;
      onSaveMonthly({
        studentId,
        title: monthlyTitle.trim(),
        description: monthlyDesc.trim(),
        subject,
        targetScore: Number(targetScore),
        progressPercent: 0,
        month: 'October 2026',
        status: 'active',
        facultyApproved: false
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Set Academic Target</h2>
              <p className="text-xs text-slate-500">Track milestones and send for mentor sign-off</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch between weekly and monthly */}
        <div className="px-5 pt-4 flex space-x-2">
          <button
            type="button"
            onClick={() => setTargetType('weekly')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
              targetType === 'weekly'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Weekly Micro Target (e.g. 75 PYQs)
          </button>
          <button
            type="button"
            onClick={() => setTargetType('monthly')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
              targetType === 'monthly'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Monthly Macro Goal (e.g. Full Mechanics)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Subject
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
            >
              {SUBJECTS_LIST.map(sub => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>

          {targetType === 'weekly' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electromagnetic Induction, Organic Nitrogen Compounds"
                  value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Metric Goal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 80 HC Verma Problems & 20 JEE PYQs"
                  value={metricDescription}
                  onChange={e => setMetricDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quota / Count Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={assignedCount}
                    onChange={e => setAssignedCount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Metric Unit
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="questions">Questions / Problems</option>
                    <option value="hours">Self-Study Hours</option>
                    <option value="topics">Curriculum Topics</option>
                    <option value="tests">Mock Tests</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Macro Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Entire Modern Physics Module"
                  value={monthlyTitle}
                  onChange={e => setMonthlyTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scope & Syllabus Deliverable
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Finish Photoelectric Effect, Bohr Model, Nuclear Physics with >85% test accuracy"
                  value={monthlyDesc}
                  onChange={e => setMonthlyDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Test Accuracy % Benchmark
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={targetScore}
                  onChange={e => setTargetScore(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}

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
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
            >
              Set Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
