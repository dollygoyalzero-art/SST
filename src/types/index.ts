export type Role = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  batch?: string; // e.g. "Apex Batch (JEE Adv 2027)", "Pinnacle NEET 2026"
  targetExam?: 'JEE Advanced' | 'JEE Main' | 'NEET' | 'CBSE Boards' | 'Foundation' | 'General';
  assignedFacultyId?: string;
  phone?: string;
  createdAt: string;
  streak: number;
  totalStudyHours: number;
  attendanceRate: number; // percentage
  status: 'active' | 'invited' | 'inactive';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  chaptersCount: number;
}

export type SlotStatus = 'pending' | 'in_progress' | 'completed' | 'missed';
export type SlotPriority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekends' | 'custom_days';
export type SlotCategory = 'study' | 'school' | 'routine' | 'exercise' | 'personal' | 'sleep';

export interface SlotComment {
  id: string;
  facultyId: string;
  facultyName: string;
  slotId?: string;
  targetId?: string;
  comment: string;
  type?: 'motivational' | 'task_critique' | 'improvement_plan' | 'approval';
  createdAt: string;
}

export interface StudySlot {
  id: string;
  studentId: string;
  category: SlotCategory; // 'study' or non-study like 'school', 'routine', etc.
  title?: string;         // Used for non-study slots (e.g., "School Hours", "Wake Up & Workout")
  subject?: string;       // Used for study slots (Physics, Chemistry, Maths, Biology)
  chapter?: string;
  topic?: string;
  startTime: string;      // "06:30"
  endTime: string;        // "08:00"
  date: string;           // "YYYY-MM-DD"
  dayOfWeek?: number;     // 1=Monday ... 7=Sunday
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; // [1, 2, 3, 4, 5, 6, 7]
  priority: SlotPriority;
  status: SlotStatus;
  notes?: string;
  comments?: SlotComment[]; // Direct mentor feedback on this slot
}

export interface WeeklyTarget {
  id: string;
  studentId: string;
  subject: string;
  chapter: string;
  targetMetric: string; // e.g. "Solve 75 PYQs", "Complete HC Verma Chapter 8"
  assignedCount: number;
  completedCount: number;
  unit: string; // "questions", "hours", "topics"
  weekNumber: number;
  year: number;
  status: 'in_progress' | 'completed' | 'overdue';
  facultyApproved?: boolean;
  facultyNotes?: string;
  comments?: SlotComment[];
  createdAt?: string;
}

export interface MonthlyTarget {
  id: string;
  studentId: string;
  title: string;
  description: string;
  subject: string;
  targetScore?: number; // e.g. 85%
  progressPercent: number;
  month: string; // "October 2026"
  status: 'active' | 'achieved' | 'missed';
  facultyApproved?: boolean;
}

export interface TaskLog {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  chapter: string;
  taskDescription: string;
  plannedDurationMins: number;
  actualDurationMins: number;
  status: 'completed' | 'pending' | 'missed';
  facultyComment?: string;
  completedAt?: string;
}

export interface FacultyComment {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  slotId?: string;
  taskId?: string;
  targetId?: string;
  type: 'motivational' | 'task_critique' | 'improvement_plan' | 'approval';
  comment: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: '10_min' | '30_min' | 'custom' | 'target_alert' | 'faculty_feedback';
  channel: 'in_app' | 'email' | 'whatsapp';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: 'delivered' | 'scheduled' | 'sent';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  unlocked: boolean;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  avatar: string;
  batch: string;
  rank: number;
  studyHours: number;
  targetCompletionPercent: number;
  streak: number;
  attendanceRate: number;
  tasksCompleted: number;
  points: number;
  badges: Badge[];
}

export interface MentorshipLink {
  id: string;
  facultyId: string;
  studentId: string;
  assignedAt: string;
  assignedBy: 'admin' | 'faculty_claim';
  active: boolean;
}
