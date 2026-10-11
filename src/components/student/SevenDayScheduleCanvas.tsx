import React, { useState } from 'react';
import { StudySlot, SlotStatus } from '../../types';
import {
  Calendar, Clock, Plus, Trash2, Check, X, Play, Coffee, School,
  Moon, Dumbbell, BookOpen, AlertCircle, Sparkles, Filter
} from 'lucide-react';

interface SevenDayScheduleCanvasProps {
  slots: StudySlot[];
  onAddSlot: (dayIndex?: number) => void;
  onUpdateStatus: (slotId: string, status: SlotStatus) => void;
  onDeleteSlot: (slotId: string) => void;
  onApplyTemplate?: () => void;
}

export const SevenDayScheduleCanvas: React.FC<SevenDayScheduleCanvasProps> = ({
  slots, onAddSlot, onUpdateStatus, onDeleteSlot, onApplyTemplate
}) => {
  const [selectedDayTab, setSelectedDayTab] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'study' | 'routine'>('all');

  const DAYS = [
    { index: 1, name: 'Monday', short: 'Mon' },
    { index: 2, name: 'Tuesday', short: 'Tue' },
    { index: 3, name: 'Wednesday', short: 'Wed' },
    { index: 4, name: 'Thursday', short: 'Thu' },
    { index: 5, name: 'Friday', short: 'Fri' },
    { index: 6, name: 'Saturday', short: 'Sat' },
    { index: 7, name: 'Sunday', short: 'Sun' }
  ];

  // Helper to determine if a slot applies to a particular day
  const isSlotActiveOnDay = (slot: StudySlot, dayIdx: number) => {
    if (slot.recurrence === 'daily') return true;
    if (slot.recurrence === 'weekdays' && dayIdx >= 1 && dayIdx <= 5) return true;
    if (slot.recurrence === 'weekends' && (dayIdx === 6 || dayIdx === 7)) return true;
    if (slot.recurrence === 'custom_days' && slot.recurrenceDays?.includes(dayIdx)) return true;
    if (slot.recurrence === 'none') {
      return (slot.dayOfWeek || 1) === dayIdx;
    }
    return false;
  };

  const getSlotsForDay = (dayIdx: number) => {
    return slots
      .filter(s => isSlotActiveOnDay(s, dayIdx))
      .filter(s => {
        if (typeFilter === 'study') return s.category === 'study';
        if (typeFilter === 'routine') return s.category !== 'study';
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Weekly stats
  const totalStudySlots = slots.filter(s => s.category === 'study').length;
  const totalRoutineSlots = slots.filter(s => s.category !== 'study').length;

  return (
    <div className="space-y-6">
      
      {/* 24-Hour Canvas Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Full 7-Day Weekly Canvas (Monday – Sunday)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Design your entire 24-hour lifestyle: map out school hours, workouts, sleep, and focused self-study sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type filter */}
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex space-x-1 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Canvas Blocks
              </button>
              <button
                onClick={() => setTypeFilter('study')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  typeFilter === 'study'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Study Only ({totalStudySlots})
              </button>
              <button
                onClick={() => setTypeFilter('routine')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  typeFilter === 'routine'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Routine & School ({totalRoutineSlots})
              </button>
            </div>

            <button
              onClick={() => onAddSlot()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Canvas Slot</span>
            </button>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center space-x-1.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDayTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedDayTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All 7 Days View
          </button>
          {DAYS.map(day => (
            <button
              key={day.index}
              onClick={() => setSelectedDayTab(day.index)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedDayTab === day.index
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State Banner (Clean Database) */}
      {slots.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Your 7-Day Canvas is Fresh and Clean
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              No dummy schedules loaded. You have complete freedom to map out your Monday through Sunday routine. Add your school hours, sleep cycle, and coaching study blocks!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onAddSlot()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Schedule Slot</span>
            </button>
            {onApplyTemplate && (
              <button
                onClick={onApplyTemplate}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load Balanced Foundation Template (Optional)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7-Day Canvas Columns Grid */}
      {slots.length > 0 && (
        <div className={`grid gap-4 ${
          selectedDayTab === 'all'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7'
            : 'grid-cols-1 max-w-2xl mx-auto'
        }`}>
          {DAYS.filter(d => selectedDayTab === 'all' || selectedDayTab === d.index).map(day => {
            const daySlots = getSlotsForDay(day.index);

            return (
              <div
                key={day.index}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-xs"
              >
                {/* Day Header */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{day.name}</h3>
                    <span className="text-[10px] text-slate-400">{daySlots.length} blocks scheduled</span>
                  </div>
                  <button
                    onClick={() => onAddSlot(day.index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title={`Add block to ${day.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Slots List */}
                <div className="p-2 space-y-2 flex-1 min-h-[220px]">
                  {daySlots.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                      <Clock className="w-5 h-5 mb-1 opacity-40" />
                      <p className="text-[11px]">Free Day</p>
                      <button
                        onClick={() => onAddSlot(day.index)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 hover:underline"
                      >
                        + Add activity
                      </button>
                    </div>
                  ) : (
                    daySlots.map(slot => {
                      const isStudy = slot.category === 'study';

                      return (
                        <div
                          key={slot.id}
                          className={`p-2.5 rounded-xl border text-xs transition ${
                            !isStudy
                              ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                              : slot.status === 'completed'
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                              : slot.status === 'in_progress'
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                              : slot.status === 'missed'
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {/* Time & Category Badge */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            
                            {isStudy ? (
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                slot.subject === 'Physics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                slot.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              }`}>
                                {slot.subject}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                                {slot.category === 'school' && <School className="w-2.5 h-2.5" />}
                                {slot.category === 'sleep' && <Moon className="w-2.5 h-2.5" />}
                                {slot.category === 'exercise' && <Dumbbell className="w-2.5 h-2.5" />}
                                {slot.category === 'routine' && <Coffee className="w-2.5 h-2.5" />}
                                <span>{slot.category}</span>
                              </span>
                            )}
                          </div>

                          {/* Title / Chapter */}
                          <div className="mb-1.5">
                            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              {isStudy ? slot.chapter : slot.title}
                            </p>
                            {isStudy && slot.topic && (
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{slot.topic}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                            {isStudy ? (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => onUpdateStatus(slot.id, 'completed')}
                                  className={`p-1 rounded text-[10px] transition ${
                                    slot.status === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-600'
                                  }`}
                                  title="Mark Completed"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(slot.id, 'in_progress')}
                                  className={`p-1 rounded text-[10px] transition ${
                                    slot.status === 'in_progress' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-600'
                                  }`}
                                  title="Mark In Progress"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(slot.id, 'missed')}
                                  className={`p-1 rounded text-[10px] transition ${
                                    slot.status === 'missed' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-600'
                                  }`}
                                  title="Mark Missed"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">Routine Block</span>
                            )}

                            <button
                              onClick={() => onDeleteSlot(slot.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
