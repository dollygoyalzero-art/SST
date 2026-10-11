import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Flame, Clock, Award, Crown, CheckCircle2, Medal, Zap, Users } from 'lucide-react';
import { INITIAL_BADGES } from '../../data/mockData';
import confetti from 'canvas-confetti';

export const LeaderboardView: React.FC = () => {
  const { users, currentUser } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  const [metric, setMetric] = useState<'hours' | 'streak' | 'attendance'>('hours');

  const triggerBadgeConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Dynamically compute leaderboard strictly from registered students in database
  const studentUsers = users.filter(u => u.role === 'student');

  const sortedStudents = [...studentUsers].sort((a, b) => {
    if (metric === 'hours') return b.totalStudyHours - a.totalStudyHours;
    if (metric === 'streak') return b.streak - a.streak;
    return b.attendanceRate - a.attendanceRate;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Meccademia Institute Honor Roll & Leaderboard
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time rankings based on study hours, target completion %, and consistency streaks
            </p>
          </div>

          {/* Timeframe & Metric Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex space-x-1 text-xs">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  period === 'weekly' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  period === 'monthly' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod('all_time')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  period === 'all_time' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All-Time
              </button>
            </div>

            <select
              value={metric}
              onChange={e => setMetric(e.target.value as any)}
              className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="hours">Rank by Study Hours</option>
              <option value="streak">Rank by Consistency Streak</option>
              <option value="attendance">Rank by Attendance Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* When no students are registered yet */}
      {studentUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
          <Trophy className="w-10 h-10 mx-auto text-amber-400 opacity-60" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Honor Roll Awaiting Real Scholars</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The database is currently clean without dummy students. As students register or are invited by administrators, their verified study hours and streaks will populate the rankings live!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedStudents.slice(0, 3).map((student, index) => {
              const rankColors = [
                'from-amber-400 to-amber-600 text-slate-950', // 1st
                'from-slate-300 to-slate-400 text-slate-900',  // 2nd
                'from-amber-700 to-amber-800 text-amber-100'  // 3rd
              ];
              const rankTitle = ['Gold Scholar', 'Silver Scholar', 'Bronze Scholar'][index];

              return (
                <div
                  key={student.id}
                  className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${
                    index === 0
                      ? 'border-amber-400 shadow-lg shadow-amber-500/10 dark:border-amber-600'
                      : 'border-slate-200 dark:border-slate-800'
                  } p-5 flex flex-col items-center text-center`}
                >
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${rankColors[index]} flex items-center justify-center font-black text-sm absolute top-4 right-4 shadow-sm`}>
                    #{index + 1}
                  </div>

                  <div className="relative mb-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                    />
                    {index === 0 && (
                      <Crown className="w-5 h-5 text-amber-500 absolute -top-2 -right-1" />
                    )}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    {rankTitle}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {student.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">{student.batch || 'General Batch'}</p>

                  <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Study Hours</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                        {student.totalStudyHours} hrs
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Streak</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center space-x-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{student.streak} days</span>
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                All Enrolled Scholars ({studentUsers.length})
              </span>
              <span className="text-xs text-slate-500">Live Database Ranks</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Scholar</th>
                    <th className="py-3 px-4">Target Exam / Batch</th>
                    <th className="py-3 px-4 text-center">Study Hours</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-center">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {sortedStudents.map((st, i) => (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        #{i + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img src={st.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {st.targetExam || 'JEE'} • {st.batch || 'Batch'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {st.totalStudyHours}h
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">
                          <Flame className="w-3 h-3" />
                          <span>{st.streak}d</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {st.attendanceRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Gamification Badges Trophy Room */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:purple-950 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Scholar Achievement Badges</h3>
              <p className="text-xs text-slate-500">Milestone awards for consistency, problem-solving, and excellence</p>
            </div>
          </div>
          <button
            onClick={triggerBadgeConfetti}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition cursor-pointer"
          >
            Celebrate Achievements
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_BADGES.map(badge => (
            <div
              key={badge.id}
              onClick={triggerBadgeConfetti}
              className="p-3.5 rounded-xl border transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center shadow-md font-bold text-lg`}>
                  ★
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{badge.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{badge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
