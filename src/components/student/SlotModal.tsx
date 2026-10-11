import React, { useState } from 'react';
import { StudySlot, SlotPriority, SlotStatus, RecurrenceType, SlotCategory } from '../../types';
import { X, Clock, Calendar, BookOpen, Coffee, RefreshCw, Sun, Moon, Dumbbell, School } from 'lucide-react';
import { SUBJECTS_LIST, NON_STUDY_CATEGORIES } from '../../data/mockData';

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: Omit<StudySlot, 'id'>) => void;
  studentId: string;
  initialDay?: number; // 1=Mon ... 7=Sun
}

export const SlotModal: React.FC<SlotModalProps> = ({
  isOpen, onClose, onSave, studentId, initialDay
}) => {
  const [slotType, setSlotType] = useState<'study' | 'non_study'>('study');
  
  // Non-study routine fields
  const [nonStudyCategory, setNonStudyCategory] = useState<SlotCategory>('school');
  const [routineTitle, setRoutineTitle] = useState('School & Classes');

  // Study fields
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');

  // Common timing fields
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('14:30');
  const [priority, setPriority] = useState<SlotPriority>('medium');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('weekdays');
  const [selectedDays, setSelectedDays] = useState<number[]>(initialDay ? [initialDay] : [1, 2, 3, 4, 5]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleCategoryChange = (cat: SlotCategory) => {
    setNonStudyCategory(cat);
    const found = NON_STUDY_CATEGORIES.find(c => c.id === cat);
    if (found) {
      setRoutineTitle(found.label);
      const times = found.defaultTime.split(' - ');
      if (times.length === 2) {
        setStartTime(times[0]);
        setEndTime(times[1]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (slotType === 'study') {
      if (!chapter.trim() || !topic.trim()) return;
      onSave({
        studentId,
        category: 'study',
        subject,
        chapter: chapter.trim(),
        topic: topic.trim(),
        startTime,
        endTime,
        date: new Date().toISOString().split('T')[0],
        dayOfWeek: initialDay || 1,
        recurrence,
        recurrenceDays: recurrence === 'weekdays' || recurrence === 'custom_days' ? selectedDays : undefined,
        priority,
        status: 'pending',
        notes: notes.trim() || undefined
      });
    } else {
      if (!routineTitle.trim()) return;
      onSave({
        studentId,
        category: nonStudyCategory,
        title: routineTitle.trim(),
        startTime,
        endTime,
        date: new Date().toISOString().split('T')[0],
        dayOfWeek: initialDay || 1,
        recurrence,
        recurrenceDays: recurrence === 'weekdays' || recurrence === 'custom_days' ? selectedDays : undefined,
        priority: 'medium',
        status: 'pending',
        notes: notes.trim() || undefined
      });
    }
    onClose();
  };

  const weekdays = [
    { label: 'M', index: 1, name: 'Mon' },
    { label: 'T', index: 2, name: 'Tue' },
    { label: 'W', index: 3, name: 'Wed' },
    { label: 'T', index: 4, name: 'Thu' },
    { label: 'F', index: 5, name: 'Fri' },
    { label: 'S', index: 6, name: 'Sat' },
    { label: 'S', index: 7, name: 'Sun' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Schedule Time Block</h2>
              <p className="text-xs text-slate-500">24-hour canvas: Map out both study and routine slots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slot Type Toggle: Study Block vs Non-Study Canvas Block */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSlotType('study');
                setStartTime('16:00');
                setEndTime('17:30');
              }}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                slotType === 'study'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Self-Study Slot</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSlotType('non_study');
                handleCategoryChange('school');
              }}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                slotType === 'non_study'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Non-Study Routine</span>
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {slotType === 'study' ? (
            <>
              {/* Subject & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    {SUBJECTS_LIST.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as SlotPriority)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Chapter & Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rotational Dynamics, Integral Calculus"
                  value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Concept / Goal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 20 PYQ problems & derivations"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              {/* Non-Study Routine Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Routine Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NON_STUDY_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as SlotCategory)}
                      className={`p-2 rounded-xl text-left border text-xs transition ${
                        nonStudyCategory === cat.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. School (7:30 AM - 2:30 PM), Gym Workout, Sleep"
                  value={routineTitle}
                  onChange={e => setRoutineTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* Time Slot Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>End Time</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Recurrence Rule */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Weekly Recurrence Pattern</span>
              </span>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="daily">Every Day (Mon - Sun)</option>
                <option value="weekdays">Weekdays (Mon - Fri)</option>
                <option value="weekends">Weekends (Sat - Sun)</option>
                <option value="custom_days">Custom Selected Days</option>
                <option value="none">One-Day Only</option>
              </select>
            </div>

            {(recurrence === 'weekdays' || recurrence === 'custom_days') && (
              <div>
                <p className="text-[11px] text-slate-500 mb-1.5">Select active days:</p>
                <div className="flex space-x-1.5">
                  {weekdays.map(day => (
                    <button
                      key={day.index}
                      type="button"
                      onClick={() => toggleDay(day.index)}
                      className={`w-7 h-7 text-xs font-semibold rounded-lg flex items-center justify-center transition ${
                        selectedDays.includes(day.index)
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Checklist / Reference Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring physics workbook, pack sports shoes, solve ex 1-15"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
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
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              Save to 7-Day Canvas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
