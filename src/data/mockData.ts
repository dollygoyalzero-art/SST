import { User, StudySlot, WeeklyTarget, MonthlyTarget, TaskLog, NotificationLog, Badge, Subject } from '../types';

/**
 * CLEAN PRODUCTION INITIAL STORE
 * Per strict requirements: ZERO fake/dummy students or faculty.
 * ONLY the administrative root user exists. All students and faculty are onboarded
 * via direct registration or Admin Invitations post-launch.
 */
export const INITIAL_USERS: User[] = [
  {
    id: 'admin_1',
    name: 'Administrator',
    email: 'ssachh2@gmail.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString().split('T')[0],
    streak: 0,
    totalStudyHours: 0,
    attendanceRate: 100,
    status: 'active'
  }
];

// Clean initial states: No dummy data!
export const INITIAL_SLOTS: StudySlot[] = [];
export const INITIAL_WEEKLY_TARGETS: WeeklyTarget[] = [];
export const INITIAL_MONTHLY_TARGETS: MonthlyTarget[] = [];
export const INITIAL_TASKS: TaskLog[] = [];
export const INITIAL_NOTIFICATIONS: NotificationLog[] = [];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b_1',
    name: 'Consistency King',
    icon: 'Crown',
    description: 'Maintained an unbroken study streak for over 14 consecutive days',
    color: 'from-amber-400 to-amber-600',
    unlocked: false
  },
  {
    id: 'b_2',
    name: 'Top Performer',
    icon: 'Trophy',
    description: 'Ranked in Top 3 in Weekly Target Completion across Meccademia',
    color: 'from-purple-500 to-indigo-600',
    unlocked: false
  },
  {
    id: 'b_3',
    name: 'Physics Prodigy',
    icon: 'Atom',
    description: 'Completed 100+ Advanced Level Physics problems with >85% accuracy',
    color: 'from-blue-500 to-cyan-500',
    unlocked: false
  },
  {
    id: 'b_4',
    name: 'Night Owl Warrior',
    icon: 'Moon',
    description: 'Logged 40+ productive evening self-study hours',
    color: 'from-indigo-600 to-purple-800',
    unlocked: false
  },
  {
    id: 'b_5',
    name: 'Centurion Scholar',
    icon: 'Flame',
    description: 'Logged over 150 hours of tracked study time on the platform',
    color: 'from-emerald-500 to-teal-700',
    unlocked: false
  }
];

export const SUBJECTS_LIST: Subject[] = [
  { id: 'sub_1', name: 'Physics', color: '#3b82f6', icon: 'Atom', chaptersCount: 28 },
  { id: 'sub_2', name: 'Chemistry', color: '#10b981', icon: 'FlaskConical', chaptersCount: 32 },
  { id: 'sub_3', name: 'Mathematics', color: '#8b5cf6', icon: 'Calculator', chaptersCount: 30 },
  { id: 'sub_4', name: 'Biology', color: '#ec4899', icon: 'Dna', chaptersCount: 38 }
];

export const NON_STUDY_CATEGORIES = [
  { id: 'school', label: 'School / College', color: '#64748b', defaultTime: '07:30 - 14:30' },
  { id: 'routine', label: 'Morning / Night Routine', color: '#f59e0b', defaultTime: '06:00 - 07:00' },
  { id: 'exercise', label: 'Workout / Sports', color: '#10b981', defaultTime: '17:00 - 18:00' },
  { id: 'personal', label: 'Meals / Family / Recreation', color: '#06b6d4', defaultTime: '13:00 - 14:00' },
  { id: 'sleep', label: 'Sleep & Recovery', color: '#6366f1', defaultTime: '23:00 - 06:00' }
];
