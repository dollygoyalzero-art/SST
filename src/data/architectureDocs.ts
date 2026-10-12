export const ARCHITECTURE_BLUEPRINT = {
  title: "Meccademia Education Institute - Student Success Tracker Architecture",
  version: "3.0.0-PROD",
  institute: "Meccademia Education Institute",
  overview: "Comprehensive production architecture, relational & NoSQL schemas, security rules, user flows, and API specifications for high-stakes entrance coaching (JEE Advanced, JEE Main, NEET, CBSE Boards) with a 24-hour 7-day canvas, Schedule Commenting System, and Historical Reports View.",

  // 1. DATABASE SCHEMA & RELATIONAL MAPPING
  databaseSchema: {
    description: "Multi-model schema specification supporting both Firebase (Firestore NoSQL) and Supabase (PostgreSQL relational with RLS). Strict tenant isolation with clean initial database (no dummy users).",
    collections: [
      {
        name: "users",
        relationalTable: "public.users",
        description: "Core identity, roles, batch assignments, and high-level tracking metrics. Open to all email domains.",
        fields: [
          { name: "id", type: "UUID / String (PK)", desc: "Unique user identifier linked to Auth UID" },
          { name: "email", type: "VARCHAR(255) UNIQUE", desc: "User email (Open to all domains: gmail, yahoo, etc.)" },
          { name: "name", type: "VARCHAR(128)", desc: "Full display name" },
          { name: "role", type: "ENUM('student', 'faculty', 'admin')", desc: "Role classification" },
          { name: "avatar_url", type: "TEXT", desc: "Public avatar image URL" },
          { name: "batch", type: "VARCHAR(64)", desc: "Assigned batch, e.g. Apex Batch (JEE Adv 2027)" },
          { name: "target_exam", type: "VARCHAR(32)", desc: "Target examination: JEE Advanced, NEET, etc." },
          { name: "assigned_faculty_id", type: "UUID (FK -> users.id)", desc: "Assigned mentor faculty member" },
          { name: "phone", type: "VARCHAR(20)", desc: "Contact number for WhatsApp notifications" },
          { name: "current_streak", type: "INT DEFAULT 0", desc: "Consecutive daily study streak" },
          { name: "total_study_hours", type: "DECIMAL(7,2) DEFAULT 0", desc: "Accumulated verified study hours" },
          { name: "attendance_rate", type: "DECIMAL(5,2) DEFAULT 100", desc: "Session attendance percentage" },
          { name: "status", type: "ENUM('active', 'invited', 'inactive')", desc: "Account state" },
          { name: "created_at", type: "TIMESTAMPTZ DEFAULT NOW()", desc: "Timestamp of record creation" }
        ],
        indexes: ["CREATE INDEX idx_users_role ON users(role);", "CREATE INDEX idx_users_assigned_faculty ON users(assigned_faculty_id);"]
      },
      {
        name: "study_slots",
        relationalTable: "public.study_slots",
        description: "7-Day 24-hour canvas blocks with Schedule Commenting System. Supports study and non-study routine blocks.",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Slot unique identifier" },
          { name: "student_id", type: "UUID (FK -> users.id)", desc: "Owner student (Strict tenant isolation)" },
          { name: "category", type: "ENUM('study', 'school', 'routine', 'exercise', 'personal', 'sleep')", desc: "Activity category" },
          { name: "title", type: "VARCHAR(128) NULLABLE", desc: "Routine title for non-study blocks" },
          { name: "subject", type: "VARCHAR(64) NULLABLE", desc: "Academic subject for study blocks" },
          { name: "chapter", type: "VARCHAR(128) NULLABLE", desc: "Curriculum chapter" },
          { name: "topic", type: "VARCHAR(255) NULLABLE", desc: "Granular concept topic" },
          { name: "start_time", type: "TIME", desc: "Slot start time (e.g., 07:30)" },
          { name: "end_time", type: "TIME", desc: "Slot end time (e.g., 14:30)" },
          { name: "date", type: "DATE", desc: "Anchor date" },
          { name: "day_of_week", type: "INT NULLABLE", desc: "ISO day number (1=Mon ... 7=Sun)" },
          { name: "recurrence", type: "ENUM('none', 'daily', 'weekdays', 'weekends', 'custom_days')", desc: "Weekly recurrence rule" },
          { name: "priority", type: "ENUM('high', 'medium', 'low')", desc: "Task urgency" },
          { name: "status", type: "ENUM('pending', 'in_progress', 'completed', 'missed')", desc: "Current completion state" },
          { name: "comments", type: "JSONB / SUBCOLLECTION", desc: "Schedule Commenting System: Direct text feedback from assigned faculty mentor" }
        ]
      },
      {
        name: "weekly_targets",
        relationalTable: "public.weekly_targets",
        description: "Weekly problem-solving and chapter quotas with mentor approval and commentary.",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Target identifier" },
          { name: "student_id", type: "UUID (FK -> users.id)", desc: "Owner student" },
          { name: "subject", type: "VARCHAR(64)", desc: "Subject target" },
          { name: "chapter", type: "VARCHAR(128)", desc: "Target chapter" },
          { name: "target_metric", type: "VARCHAR(255)", desc: "Goal description (e.g., Solve 75 HC Verma PYQs)" },
          { name: "assigned_count", type: "INT", desc: "Target quantity" },
          { name: "completed_count", type: "INT DEFAULT 0", desc: "Logged progress quantity" },
          { name: "unit", type: "VARCHAR(32)", desc: "Unit type: questions, hours, topics" },
          { name: "faculty_approved", type: "BOOLEAN DEFAULT FALSE", desc: "Mentor approval status" },
          { name: "comments", type: "JSONB / SUBCOLLECTION", desc: "Schedule Commenting System: Direct mentor critique and suggestions" }
        ]
      },
      {
        name: "task_logs",
        relationalTable: "public.task_logs",
        description: "Granular activity durations for Historical Reports View.",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Log identifier" },
          { name: "student_id", type: "UUID (FK -> users.id)", desc: "Student owner" },
          { name: "date", type: "DATE", desc: "Execution date" },
          { name: "subject", type: "VARCHAR(64)", desc: "Subject" },
          { name: "planned_duration_mins", type: "INT", desc: "Planned minutes" },
          { name: "actual_duration_mins", type: "INT", desc: "Actual minutes" },
          { name: "status", type: "ENUM('completed', 'missed', 'partial')", desc: "Result" },
          { name: "faculty_comment", type: "TEXT NULLABLE", desc: "Faculty review note" }
        ]
      }
    ]
  },

  // 2. THEME & NEXT-THEMES IMPLEMENTATION CODE SPECIFICATION
  themeProviderSpec: {
    title: "Functional Dark/Light Mode with next-themes",
    layoutCode: `// app/layout.tsx (Next.js 14+ App Router)
import { ThemeProvider } from 'next-themes';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`,
    tailwindConfig: `// tailwind.config.js
module.exports = {
  darkMode: 'class', // Critical: enables class-based dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
    toggleComponent: `// components/theme/ThemeToggle.tsx
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      aria-label="Toggle Dark/Light Mode"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
    </button>
  );
};`
  },

  // 3. REAL-TIME ADMIN SUITE SPECIFICATION
  realtimeAdminSpec: {
    title: "Real-Time User Directory & Registration Listener",
    description: "When a student registers via a shared link or open signup, they instantly appear on the Admin's screen via real-time WebSocket / Firestore snapshot stream.",
    firestoreQuery: `// Firebase Firestore Real-Time Query in React
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function listenToUsers(onUsersChanged: (users: User[]) => void) {
  const usersQuery = query(collection(db, 'users'), orderBy('created_at', 'desc'));
  return onSnapshot(usersQuery, (snapshot) => {
    const liveUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    onUsersChanged(liveUsers);
  });
}`,
    supabaseQuery: `// Supabase Postgres Real-Time Changes in React
import { supabase } from '@/lib/supabase';

export function subscribeToSupabaseUsers(onRefresh: () => void) {
  return supabase
    .channel('public:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
      console.log('Realtime DB user changed:', payload);
      onRefresh();
    })
    .subscribe();
}`,
    expressApi: `// Express REST Active Route (server.ts)
app.get('/api/users', (req, res) => {
  res.json({ success: true, users: usersStore, total: usersStore.length });
});

app.post('/api/users', (req, res) => {
  const newUser = { id: \`user_\${Date.now()}\`, ...req.body, status: 'active' };
  usersStore.unshift(newUser);
  res.status(201).json({ success: true, user: newUser });
});`
  },

  // 4. SCHEDULE COMMENTING SYSTEM SPECIFICATION
  scheduleCommentingSpec: {
    title: "Schedule Commenting System (Direct Mentor Feedback)",
    overview: "Mentors inspect assigned mentees' 7-day canvas slots and weekly targets, leaving targeted text guidance directly on individual schedule cards.",
    features: [
      "Mentors click 'Comment on Slot' on any daily study block",
      "Categorized feedback tags: Motivational Note, Missed Task Critique, Recovery Plan",
      "Immediate persistence into slot.comments JSON subcollection",
      "Automatic push notification to student via in-app alert & synced WhatsApp notification",
      "Students view comments directly on their Schedule Canvas and History Reports view"
    ]
  },

  // 5. HISTORICAL REPORTS VIEW SPECIFICATION
  historicalReportsSpec: {
    title: "Student History & Reports View",
    overview: "Retrospective view on Student Dashboard allowing students to inspect exactly what tasks and schedule blocks they completed over specific timeframes.",
    timeframes: ["Past Week (last 7 days)", "Past Month (last 30 days)", "All Time"],
    features: [
      "Filter by Completed Schedule Slots vs Completed Tasks vs All Completed",
      "Subject breakdown analysis (Physics, Chemistry, Mathematics, Biology)",
      "Planned vs actual study duration comparison bar chart",
      "Mentor comments and recommendations received during the period",
      "One-click CSV Export for student records"
    ]
  },

  // 6. CODE STRUCTURE TREE
  codeStructure: `meccademia-student-success-tracker/
├── package.json
├── tsconfig.json
├── server.ts                       # Express backend + Gemini SDK + Seeded Admin + REST User API
├── src/
│   ├── main.tsx                    # Client entry + ThemeProvider wrapper
│   ├── App.tsx                     # Core Application Router & Navigation
│   ├── index.css                   # Tailwind v4 class-based dark mode styles
│   ├── types/
│   │   └── index.ts                # Domain interfaces (StudySlot, SlotComment, WeeklyTarget, TaskLog)
│   ├── data/
│   │   ├── mockData.ts             # Clean initial store (ZERO dummy students/faculty)
│   │   └── architectureDocs.ts     # Architecture specifications and documentation
│   ├── context/
│   │   └── AuthContext.tsx         # Open registration, real-time polling, Schedule Commenting System
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Meccademia branding, theme toggle, notifications
│   │   │   └── Footer.tsx          # Meccademia copyright & encryption notes
│   │   ├── theme/
│   │   │   └── ThemeToggle.tsx     # Working next-themes Sun/Moon switch
│   │   ├── auth/
│   │   │   ├── StudentLogin.tsx    # Dedicated /login/student (Open Domain)
│   │   │   ├── FacultyLogin.tsx    # Dedicated /login/faculty (Open Domain)
│   │   │   └── AdminLogin.tsx      # Dedicated /login/admin (Strict backend auth, zero UI leaks)
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx        # Overview, Recharts graphs, KPIs
│   │   │   ├── SevenDayScheduleCanvas.tsx  # Full 7-Day 24-hr canvas + mentor comments
│   │   │   ├── HistoricalReportsView.tsx   # Past Week and Past Month completed reports
│   │   │   ├── SlotModal.tsx               # Add Study or Routine time blocks
│   │   │   ├── TargetModal.tsx             # Set weekly & monthly targets
│   │   │   ├── TaskModal.tsx               # Log planned vs actual duration
│   │   │   ├── ReminderConfigModal.tsx     # 10m/30m/WhatsApp/Email notifications
│   │   │   ├── AIStudyCoach.tsx            # Weak subject diagnostics + Gemini 3.8 Flash TTS
│   │   │   ├── SearchStudyExplorer.tsx     # Google Search Grounded exam explorer
│   │   │   └── LeaderboardView.tsx         # Multi-metric leaderboard
│   │   ├── faculty/
│   │   │   └── FacultyDashboard.tsx        # Schedule Commenting System, mentee claiming, target approval
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx          # Real-time user CRUD, invite system, query inspector
│   │   └── docs/
│   │       └── ArchitectureViewer.tsx      # In-app architecture blueprint viewer
`
};
