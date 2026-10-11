export const ARCHITECTURE_BLUEPRINT = {
  title: "Meccademia Education Institute - Student Success Tracker Architecture",
  version: "2.0.0-PROD",
  institute: "Meccademia Education Institute",
  overview: "Comprehensive production architecture, relational & NoSQL schemas, security rules, user flows, and API specifications for high-stakes entrance coaching (JEE Advanced, JEE Main, NEET, CBSE Boards) with a 24-hour 7-day canvas and historical analytics.",

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
        description: "7-Day 24-hour canvas blocks. Supports both study sessions and non-study routine blocks (school, sleep, gym, meals).",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Slot unique identifier" },
          { name: "student_id", type: "UUID (FK -> users.id)", desc: "Owner student (Strict tenant isolation)" },
          { name: "category", type: "ENUM('study', 'school', 'routine', 'exercise', 'personal', 'sleep')", desc: "Activity category" },
          { name: "title", type: "VARCHAR(128) NULLABLE", desc: "Routine title for non-study blocks (e.g., School Hours)" },
          { name: "subject", type: "VARCHAR(64) NULLABLE", desc: "Academic subject for study blocks (Physics, Chemistry, Maths, Biology)" },
          { name: "chapter", type: "VARCHAR(128) NULLABLE", desc: "Curriculum chapter" },
          { name: "topic", type: "VARCHAR(255) NULLABLE", desc: "Granular concept topic" },
          { name: "start_time", type: "TIME", desc: "Slot start time (e.g., 07:30)" },
          { name: "end_time", type: "TIME", desc: "Slot end time (e.g., 14:30)" },
          { name: "date", type: "DATE", desc: "Anchor date" },
          { name: "day_of_week", type: "INT NULLABLE", desc: "ISO day number (1=Mon ... 7=Sun)" },
          { name: "recurrence", type: "ENUM('none', 'daily', 'weekdays', 'weekends', 'custom_days')", desc: "Weekly recurrence rule" },
          { name: "recurrence_days", type: "INT[]", desc: "Selected days [1..7]" },
          { name: "priority", type: "ENUM('high', 'medium', 'low')", desc: "Task urgency classification" },
          { name: "status", type: "ENUM('pending', 'in_progress', 'completed', 'missed')", desc: "Execution status" },
          { name: "notes", type: "TEXT", desc: "Special checklist notes" }
        ],
        indexes: ["CREATE INDEX idx_study_slots_student_date ON study_slots(student_id, date);", "CREATE INDEX idx_study_slots_category ON study_slots(category);"]
      },
      {
        name: "weekly_targets",
        relationalTable: "public.weekly_targets",
        description: "Micro-goals per chapter with numerical metrics, completion percentage, and faculty approval.",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Target unique identifier" },
          { name: "student_id", type: "UUID (FK -> users.id)", desc: "Student owner" },
          { name: "subject", type: "VARCHAR(64)", desc: "Associated subject" },
          { name: "chapter", type: "VARCHAR(128)", desc: "Chapter title" },
          { name: "target_metric", type: "VARCHAR(255)", desc: "Goal description (e.g., Solve 80 HC Verma Qs)" },
          { name: "assigned_count", type: "INT", desc: "Target quota" },
          { name: "completed_count", type: "INT DEFAULT 0", desc: "Actual completed count" },
          { name: "unit", type: "VARCHAR(32)", desc: "Metric unit: questions, hours, topics" },
          { name: "week_number", type: "INT", desc: "Calendar week number (1-52)" },
          { name: "year", type: "INT", desc: "Academic calendar year" },
          { name: "status", type: "ENUM('in_progress', 'completed', 'overdue')", desc: "Completion state" },
          { name: "faculty_approved", type: "BOOLEAN DEFAULT FALSE", desc: "Mentor sign-off flag" },
          { name: "faculty_notes", type: "TEXT", desc: "Mentor guidance notes" }
        ],
        indexes: ["CREATE INDEX idx_weekly_targets_student_week ON weekly_targets(student_id, year, week_number);"]
      },
      {
        name: "task_logs",
        relationalTable: "public.task_logs",
        description: "Granular activity audit log tracking planned vs actual duration. Powers past week, month, and year retrospective reports.",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Task log identifier" },
          { name: "student_id", type: "UUID (FK -> users.id)", desc: "Student reference" },
          { name: "date", type: "DATE", desc: "Execution date" },
          { name: "subject", type: "VARCHAR(64)", desc: "Subject" },
          { name: "chapter", type: "VARCHAR(128)", desc: "Chapter" },
          { name: "task_description", type: "TEXT", desc: "Exact activity logged" },
          { name: "planned_duration_mins", type: "INT", desc: "Target planned duration in minutes" },
          { name: "actual_duration_mins", type: "INT", desc: "Actual logged duration in minutes" },
          { name: "status", type: "ENUM('completed', 'pending', 'missed')", desc: "Task execution state" },
          { name: "faculty_comment", type: "TEXT", desc: "Feedback provided by mentor" },
          { name: "completed_at", type: "TIME", desc: "Completion timestamp" }
        ],
        indexes: ["CREATE INDEX idx_task_logs_student_date ON task_logs(student_id, date);"]
      },
      {
        name: "notifications",
        relationalTable: "public.notifications",
        description: "Omni-channel reminder log (In-app, Email, WhatsApp).",
        fields: [
          { name: "id", type: "UUID (PK)", desc: "Notification identifier" },
          { name: "user_id", type: "UUID (FK -> users.id)", desc: "Recipient user ID" },
          { name: "type", type: "VARCHAR(32)", desc: "Trigger category: 10_min, 30_min, custom, target_alert" },
          { name: "channel", type: "ENUM('in_app', 'email', 'whatsapp')", desc: "Dispatch channel" },
          { name: "title", type: "VARCHAR(255)", desc: "Notification subject" },
          { name: "message", type: "TEXT", desc: "Notification body content" },
          { name: "timestamp", type: "TIMESTAMPTZ DEFAULT NOW()", desc: "Send timestamp" },
          { name: "read", type: "BOOLEAN DEFAULT FALSE", desc: "Read status flag" }
        ]
      }
    ],
    firestoreSecurityRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return request.auth.uid == userId; }
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isAdmin() { return isAuthenticated() && getUserRole() == 'admin'; }
    function isFaculty() { return isAuthenticated() && getUserRole() == 'faculty'; }

    // Users: Public registration open to all email domains
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if true;
      allow update, delete: if isAdmin() || isOwner(userId);
    }

    // Study Slots: Strict Student Tenant Isolation
    match /study_slots/{slotId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.studentId) || isFaculty() || isAdmin());
      allow create: if isAuthenticated() && isOwner(request.resource.data.studentId);
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.studentId) || isAdmin());
    }

    // Weekly Targets & Approvals
    match /weekly_targets/{targetId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.studentId) || isFaculty() || isAdmin());
      allow create: if isAuthenticated() && isOwner(request.resource.data.studentId);
      allow update: if isAuthenticated() && (isOwner(resource.data.studentId) || isFaculty() || isAdmin());
      allow delete: if isAuthenticated() && (isOwner(resource.data.studentId) || isAdmin());
    }

    // Task Logs: Powers Historical Reports
    match /task_logs/{logId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.studentId) || isFaculty() || isAdmin());
      allow create, update: if isAuthenticated() && (isOwner(resource.data.studentId) || isAdmin());
      allow delete: if isAdmin() || isOwner(resource.data.studentId);
    }
  }
}`
  },

  // 2. UI WIREFRAMES & LAYOUT MAP
  wireframes: {
    studentLoginScreen: {
      route: "/login/student",
      purpose: "Dedicated student portal with registration open to all email domains (no @meccademia domain restriction).",
      layout: [
        "Header: Meccademia Seal + 'Student Portal' badge.",
        "Toggle: 'Sign In' vs 'Create Account' (Open to all email domains: gmail, yahoo, outlook).",
        "Sign In Form: Email Address, Password, Remember Device, Forgot Password trigger.",
        "Create Account Form: Full Name, Email (any domain), Target Exam, Batch, Password, 'Register & Open 7-Day Canvas'.",
        "Footnote Links: Faculty Gateway and Central Admin Command."
      ]
    },
    facultyLoginScreen: {
      route: "/login/faculty",
      purpose: "Dedicated educator and mentor gateway for student progress monitoring.",
      layout: [
        "Header: Meccademia Seal + 'Faculty Gateway' badge in emerald green.",
        "Toggle: 'Sign In' vs 'Register as Faculty' (Open to all email domains).",
        "Form: Faculty Email, Department (Physics, Chemistry, Maths, Biology), Password.",
        "Footnote Links: Scholar Portal and Central Admin Command."
      ]
    },
    adminLoginScreen: {
      route: "/login/admin",
      purpose: "Restricted administrative suite. Authenticated against backend seed ssachh2@gmail.com with zero credentials visible on UI.",
      layout: [
        "Header: Meccademia Seal + 'Central Administration Command' in dark slate/amber.",
        "Security Notice: 'Restricted Access: Meccademia Administrative Personnel Only'.",
        "Inputs: Administrator Email, Security Key (strictly verified against backend seed ssachh2@gmail.com / admin123).",
        "Zero Credentials Exposed on UI."
      ]
    },
    studentDashboard: {
      route: "/dashboard/student",
      purpose: "Comprehensive scholar control center with 7-day canvas timetable, historical analytics, and targets.",
      layout: [
        "Hero Row: Current streak, total hours, target completion %, attendance %, pending vs done slots.",
        "Navigation Sub-tabs: Overview & Trends, 7-Day Canvas Planner, Targets, Historical Reports, Honor Roll, Exam Explorer.",
        "Overview: Recharts BarChart (Subject hours vs quota) & AreaChart (Velocity trend).",
        "AI Study Coach: Real-time weak subject detection & audio player (gemini-3.8-flash-tts)."
      ],
      sections: [
        "1. Top Navigation: Student Profile, flame streak counter, study hours, theme toggle, live voice mentor button, notifications bell.",
        "2. Quick Stats Row: [Current Streak] [Total Study Hours] [Weekly Targets] [Attendance %] [Canvas Blocks].",
        "3. AI Academic Coach: Subject diagnostic advice and voice audio synthesis.",
        "4. Full 7-Day Canvas Timetable: 24-hr daily routine mapping (School, Sleep, Routine, Study).",
        "5. Targets Management: Weekly and monthly targets with interactive progress bars.",
        "6. Historical Reports: Retrospective analytics across past week, month, and year.",
        "7. Gamification & Leaderboard: Live rankings computed from enrolled scholars."
      ]
    },
    facultyDashboard: {
      route: "/dashboard/faculty",
      purpose: "Faculty mentorship workspace for monitoring assigned students and claiming unassigned scholars.",
      layout: [
        "Top Bar: Faculty profile, mentee count, unassigned students waiting pool.",
        "Claim Pool: Cards for unassigned scholars with 1-click 'Claim Mentee' action.",
        "Assigned Mentee List: Filterable list with study hours, streaks, and missed session alerts.",
        "Mentee Inspector: 7-day schedule view, target sign-off, and feedback dispatch form."
      ],
      sections: [
        "1. Faculty Profile Banner: Senior Faculty mentor credentials and mentee counter.",
        "2. Unassigned Scholars Pool: Claim students awaiting mentorship.",
        "3. Assigned Mentees Directory: Click to inspect student schedule.",
        "4. Deep-Dive Inspection: View selected mentee's 7-day canvas and active targets.",
        "5. Feedback Dispatch: Send critique or motivational guidance via WhatsApp/In-App."
      ]
    },
    adminDashboard: {
      route: "/dashboard/admin",
      purpose: "Central administration suite with clean real-time user CRUD and mentorship matrix.",
      layout: [
        "Metrics: Total Students, Total Faculty, Average Study Hours, Average Attendance.",
        "User Directory: Real-time CRUD table with search and role filters.",
        "Invite System: Dispatch SendGrid email / WhatsApp invites to any email domain.",
        "Mentorship Matrix: 1-click dropdown re-assignment of faculty to students."
      ],
      sections: [
        "1. Institute Command Banner: High-level KPI aggregations.",
        "2. User Management Suite: Full CRUD (Add, Edit, Delete) for Faculty and Students.",
        "3. Invitation Dispatcher: Invite new students/mentors without domain lock-in.",
        "4. Mentorship Matrix: Reassign or link students to faculty mentors."
      ]
    }
  },

  // 3. USER FLOWS
  userFlows: [
    {
      name: "Admin Inviting a User Flow",
      steps: [
        "1. Admin opens /dashboard/admin and clicks '+ Send Invitation'.",
        "2. Enters candidate email (any domain: gmail, yahoo, etc.), selects role (Student/Faculty), and channel (Email/WhatsApp).",
        "3. Submits form -> POST /api/auth/invite (or /api/admin/invite).",
        "4. Backend provisions user in clean database with status='invited' and generates secure activation token.",
        "5. Notification gateway dispatches activation link to the recipient.",
        "6. User clicks activation link, sets their password, and transitions from 'invited' to 'active'."
      ]
    },
    {
      name: "Faculty Claiming an Unassigned Student Flow",
      steps: [
        "1. Faculty logs in to /dashboard/faculty.",
        "2. Views 'Unassigned Scholars Awaiting Academic Mentors' pool banner.",
        "3. Faculty inspects student's target exam (JEE/NEET) and study velocity.",
        "4. Clicks 'Claim Mentee' -> POST /api/faculty/claim-mentee.",
        "5. Backend links student.assigned_faculty_id = faculty.id and logs mentorship link.",
        "6. Student receives immediate in-app and WhatsApp notification of mentor assignment."
      ]
    },
    {
      name: "Student Creating a 7-Day Canvas & Recurring Schedule Flow",
      steps: [
        "1. Student opens /dashboard/student -> 7-Day Canvas Planner tab.",
        "2. Clicks '+ Add Canvas Slot' or clicks '+' on a specific day column (e.g. Wednesday).",
        "3. Chooses block type: 'Self-Study Slot' OR 'Non-Study Routine' (School, Routine, Workout, Sleep).",
        "4. Sets start and end time (e.g. 07:30 - 14:30 'School', or 16:00 - 17:45 'Physics - Rotational Dynamics').",
        "5. Configures recurrence: 'Weekdays (Mon-Fri)', 'Daily', or custom days.",
        "6. Submits -> block appears across 7-day canvas timeline with live status controls."
      ]
    }
  ],

  // 4. API ROUTE DESIGN
  apiRoutes: [
    {
      category: "Authentication (Open Domain)",
      routes: [
        { method: "POST", path: "/api/auth/login", payload: "{ email, password, role }", desc: "Validates credentials. Checks backend seeded admin ssachh2@gmail.com securely." },
        { method: "POST", path: "/api/auth/register", payload: "{ name, email, password, role, batch, targetExam }", desc: "Registers user (open to all domains: gmail, yahoo, etc.)" }
      ]
    },
    {
      category: "7-Day Canvas Scheduling",
      routes: [
        { method: "GET", path: "/api/student/slots", payload: "Query: ?studentId=UUID", desc: "Returns 7-day schedule blocks" },
        { method: "POST", path: "/api/student/slots", payload: "{ category, title?, subject?, chapter?, startTime, endTime, recurrence }", desc: "Creates canvas study or routine block" },
        { method: "PATCH", path: "/api/student/slots/:id/status", payload: "{ status }", desc: "Updates block status" },
        { method: "DELETE", path: "/api/student/slots/:id", payload: "None", desc: "Deletes canvas block" }
      ]
    },
    {
      category: "Historical Reports & Audit",
      routes: [
        { method: "GET", path: "/api/student/tasks/history", payload: "Query: ?timeframe=week|month|year", desc: "Returns retrospective task logs and duration stats" },
        { method: "POST", path: "/api/student/tasks", payload: "{ subject, chapter, taskDescription, plannedMins, actualMins, status }", desc: "Logs completed activity" }
      ]
    },
    {
      category: "Admin & Faculty Operations",
      routes: [
        { method: "POST", path: "/api/admin/users", payload: "{ name, email, role, batch }", desc: "Creates user in clean database" },
        { method: "POST", path: "/api/admin/invite", payload: "{ email, role, channel }", desc: "Sends invite to any email domain" },
        { method: "POST", path: "/api/faculty/claim-mentee", payload: "{ studentId }", desc: "Claims unassigned student" },
        { method: "PATCH", path: "/api/faculty/targets/:id/approve", payload: "{ approved, notes }", desc: "Approves weekly target" }
      ]
    }
  ],

  // 5. MONOREPO CODE STRUCTURE
  codeStructure: `meccademia-student-success-tracker/
├── package.json
├── tsconfig.json
├── server.ts                       # Express backend + Gemini SDK + Seeded Admin + Open Domain Auth
├── src/
│   ├── main.tsx                    # Client entry
│   ├── App.tsx                     # Core Application Router & Modals
│   ├── index.css                   # Tailwind v4 styles with dark mode support
│   ├── types/
│   │   └── index.ts                # Domain interfaces (StudySlot with 7-day canvas & routine types)
│   ├── data/
│   │   ├── mockData.ts             # Clean initial store (NO dummy students/faculty)
│   │   └── architectureDocs.ts     # Architecture specifications and documentation
│   ├── context/
│   │   └── AuthContext.tsx         # Open registration, clean session management, theme toggle
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Meccademia crest, theme toggle, live voice mentor, notifications
│   │   │   └── Footer.tsx          # Meccademia copyright & encryption notes
│   │   ├── auth/
│   │   │   ├── StudentLogin.tsx    # Dedicated /login/student (Sign in + Open Domain Register)
│   │   │   ├── FacultyLogin.tsx    # Dedicated /login/faculty (Sign in + Open Domain Register)
│   │   │   └── AdminLogin.tsx      # Dedicated /login/admin (Strict backend auth, zero UI leaks)
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx        # Overview, Recharts graphs, KPIs
│   │   │   ├── SevenDayScheduleCanvas.tsx  # Full 7-Day 24-hr canvas (routine & study blocks)
│   │   │   ├── HistoricalReportsView.tsx   # Past week, month, and year retrospective reports
│   │   │   ├── SlotModal.tsx               # Add Study or Routine time blocks
│   │   │   ├── TargetModal.tsx             # Set weekly & monthly targets
│   │   │   ├── TaskModal.tsx               # Log planned vs actual duration
│   │   │   ├── ReminderConfigModal.tsx     # 10m/30m/WhatsApp/Email notifications
│   │   │   ├── AIStudyCoach.tsx            # Weak subject diagnostics + Gemini 3.8 Flash TTS
│   │   │   ├── SearchStudyExplorer.tsx     # Google Search Grounded exam explorer
│   │   │   └── LeaderboardView.tsx         # Dynamic live leaderboard
│   │   ├── faculty/
│   │   │   └── FacultyDashboard.tsx        # Mentee claiming, progress review, target approval
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx          # Real-time user CRUD, invite system, mentorship matrix
│   │   ├── ai/
│   │   │   └── VoiceMentorModal.tsx        # Gemini 3.8 Live API interactive voice conversation
│   │   └── docs/
│   │       └── ArchitectureViewer.tsx      # In-app architecture blueprint viewer
`
};
