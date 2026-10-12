import React, { useState } from 'react';
import { ARCHITECTURE_BLUEPRINT } from '../../data/architectureDocs';
import {
  BookOpen, Database, Layout, GitFork, Server, FolderTree, Copy,
  Check, ArrowRight, ShieldCheck, FileCode, CheckCircle2, Moon, Radio
} from 'lucide-react';

interface ArchitectureViewerProps {
  onClose?: () => void;
}

export const ArchitectureViewer: React.FC<ArchitectureViewerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'theme' | 'realtime' | 'wireframes' | 'flows' | 'api' | 'structure'>('schema');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/20 text-white border border-white/20">
                Official Deliverable Spec
              </span>
              <span className="text-xs font-mono opacity-80">v3.0.0-PROD</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Architecture, Schemas & Production Design Blueprint
            </h1>
            <p className="text-xs text-amber-100 max-w-2xl mt-1">
              High-stakes entrance preparation platform for Meccademia Education Institute. Includes next-themes specs, Real-Time Admin query logic, Schedule Commenting System, and Historical Reports View.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-amber-100 transition shadow cursor-pointer"
            >
              Back to Live Application
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>1. Database Schema</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>2. next-themes Spec</span>
        </button>

        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'realtime'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>3. Real-Time Admin Query</span>
        </button>

        <button
          onClick={() => setActiveTab('wireframes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'wireframes'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>4. UI Wireframes</span>
        </button>

        <button
          onClick={() => setActiveTab('flows')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'flows'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>5. User Flows</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'api'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>6. REST APIs</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'structure'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>7. Project Tree</span>
        </button>
      </div>

      {/* Tab 1: Database Schema */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Multi-Model Schema Architecture: Relational (PostgreSQL / Supabase) & NoSQL (Firestore)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All core entity tables mapped with data types, foreign keys, and Schedule Commenting subcollections.
            </p>

            <div className="space-y-4">
              {ARCHITECTURE_BLUEPRINT.databaseSchema.collections.map(col => (
                <div key={col.name} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {col.relationalTable}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">({col.name} in Firestore)</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{col.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(col.fields, null, 2), col.name)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === col.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === col.name ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-2">Field</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {col.fields.map(f => (
                          <tr key={f.name}>
                            <td className="py-1.5 font-bold text-slate-800 dark:text-slate-200">{f.name}</td>
                            <td className="py-1.5 text-indigo-600 dark:text-indigo-400">{f.type}</td>
                            <td className="py-1.5 text-slate-500 font-sans">{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: next-themes Specification */}
      {activeTab === 'theme' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Functional Dark/Light Mode with next-themes
            </h3>
            <p className="text-slate-500">
              The required implementation includes the ThemeProvider wrapper in Next.js layout, class dark mode configuration in Tailwind, and the ThemeToggle component.
            </p>
          </div>

          <div className="space-y-4 font-mono">
            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-bold font-sans">1. Next.js App Router: app/layout.tsx wrapper</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.themeProviderSpec.layoutCode, 'theme_layout')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'theme_layout' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'theme_layout' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-emerald-300">
                {ARCHITECTURE_BLUEPRINT.themeProviderSpec.layoutCode}
              </pre>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-bold font-sans">2. tailwind.config.js (darkMode: 'class')</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.themeProviderSpec.tailwindConfig, 'theme_tw')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'theme_tw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'theme_tw' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-cyan-300">
                {ARCHITECTURE_BLUEPRINT.themeProviderSpec.tailwindConfig}
              </pre>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 font-bold font-sans">3. Working Toggle Button Component (components/theme/ThemeToggle.tsx)</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.themeProviderSpec.toggleComponent, 'theme_comp')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'theme_comp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'theme_comp' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-purple-300">
                {ARCHITECTURE_BLUEPRINT.themeProviderSpec.toggleComponent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Real-Time Admin Query Specification */}
      {activeTab === 'realtime' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Real-Time Admin Suite Query & Broadcast Logic
            </h3>
            <p className="text-slate-500">
              Guarantees that when a student registers via a shared link, they instantly appear on the Admin's screen.
            </p>
          </div>

          <div className="space-y-4 font-mono">
            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-bold font-sans">Firebase Firestore onSnapshot Listener</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.realtimeAdminSpec.firestoreQuery, 'rt_fs')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'rt_fs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'rt_fs' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-emerald-300">
                {ARCHITECTURE_BLUEPRINT.realtimeAdminSpec.firestoreQuery}
              </pre>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-bold font-sans">Supabase Postgres Realtime Subscription</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.realtimeAdminSpec.supabaseQuery, 'rt_sb')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'rt_sb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'rt_sb' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-cyan-300">
                {ARCHITECTURE_BLUEPRINT.realtimeAdminSpec.supabaseQuery}
              </pre>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-400 font-bold font-sans">Express REST API (server.ts)</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.realtimeAdminSpec.expressApi, 'rt_exp')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'rt_exp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'rt_exp' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-amber-300">
                {ARCHITECTURE_BLUEPRINT.realtimeAdminSpec.expressApi}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: UI Wireframes */}
      {activeTab === 'wireframes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs space-y-2">
            <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">Student Dashboard & Schedule Canvas</h4>
            <p className="text-slate-600 dark:text-slate-300">
              7-Day 24-Hour Schedule Canvas supporting study & routine blocks, direct mentor comments, Recharts KPI velocity graphs, target tracker, and historical reports view.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs space-y-2">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Faculty Mentor & Schedule Commenting</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Inspect assigned mentees, claim unassigned students, approve weekly quotas, and leave text comments directly on individual schedule cards and targets.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs space-y-2">
            <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm">Admin Command Suite</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Real-time directory auto-fetching newly registered students and faculty, user CRUD, email/WhatsApp invites, and mentorship assignment matrix.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs space-y-2">
            <h4 className="font-bold text-purple-600 dark:text-purple-400 text-sm">Student History & Reports View</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Filter by Past Week and Past Month to review completed schedules and task durations, subject distribution charts, and mentor notes.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: User Flows */}
      {activeTab === 'flows' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Student Open Registration & Live Admin Detection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-indigo-600 block mb-1">Step 1</span>
                Student registers via open registration link (any email domain).
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-indigo-600 block mb-1">Step 2</span>
                Backend receives POST /api/users, saves user, and broadcasts change.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-indigo-600 block mb-1">Step 3</span>
                Admin Dashboard onSnapshot/polling receives new user and instantly displays card.
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Schedule Commenting Flow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block mb-1">Step 1</span>
                Faculty opens mentee daily/weekly schedule slots.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block mb-1">Step 2</span>
                Clicks "Comment on Slot", enters text feedback and chooses category tag.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block mb-1">Step 3</span>
                Comment saved to slot; student receives WhatsApp alert and sees comment on canvas!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: REST APIs */}
      {activeTab === 'api' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-700">GET</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">/api/users</span>
            </div>
            <p className="text-slate-500 mt-1">Fetches all registered students and faculty in real-time for Admin Suite.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-700">POST</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">/api/auth/login</span>
            </div>
            <p className="text-slate-500 mt-1">Authenticates users. Explicit backend check for hardcoded administrator credentials.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-700">POST</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">/api/users</span>
            </div>
            <p className="text-slate-500 mt-1">Registers new student or faculty open to any email domain.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-700">PUT</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">/api/users/:id</span>
            </div>
            <p className="text-slate-500 mt-1">Updates user details or reassigns faculty mentorship.</p>
          </div>
        </div>
      )}

      {/* Tab 7: Code Structure Tree */}
      {activeTab === 'structure' && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Full Production Repository Folder Structure</span>
            </div>
            <button
              onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.codeStructure, 'code_struct')}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedKey === 'code_struct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-400">
            {ARCHITECTURE_BLUEPRINT.codeStructure}
          </pre>
        </div>
      )}

    </div>
  );
};
