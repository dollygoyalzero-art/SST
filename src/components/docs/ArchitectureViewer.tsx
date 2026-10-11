import React, { useState } from 'react';
import { ARCHITECTURE_BLUEPRINT } from '../../data/architectureDocs';
import {
  BookOpen, Database, Layout, GitFork, Server, FolderTree, Copy,
  Check, ArrowRight, ShieldCheck, FileCode, CheckCircle2
} from 'lucide-react';

interface ArchitectureViewerProps {
  onClose?: () => void;
}

export const ArchitectureViewer: React.FC<ArchitectureViewerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'wireframes' | 'flows' | 'api' | 'structure'>('schema');
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
              <span className="text-xs font-mono opacity-80">v1.0.0-PROD</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Architecture, Schemas & Production Design Blueprint
            </h1>
            <p className="text-xs text-amber-100 max-w-2xl mt-1">
              High-stakes entrance preparation platform for Meecademia Education Institute. Complete specifications for Database Schema, Wireframes, User Flows, REST APIs, and Project Tree.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-amber-100 transition shadow"
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'schema'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>1. Database Schema & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('wireframes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'wireframes'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>2. UI Wireframes & Layout Map</span>
        </button>

        <button
          onClick={() => setActiveTab('flows')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'flows'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>3. User Flow Diagrams</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'api'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>4. API Route Design</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'structure'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>5. Code Structure Tree</span>
        </button>
      </div>

      {/* Tab 1: Database Schema & Firebase / Supabase structure */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Dual-Model Architecture: Relational (PostgreSQL / Supabase) & NoSQL (Firestore)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All 12 core entity tables mapped with data types, relational foreign keys, performance indexes, and strict row-level security.
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
                      className="text-xs p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Copy schema fields"
                    >
                      {copiedKey === col.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Field / Column Name</th>
                          <th className="py-2 px-3">Data Type & Constraint</th>
                          <th className="py-2 px-3">Description & Relational Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {col.fields.map(f => (
                          <tr key={f.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{f.name}</td>
                            <td className="py-2 px-3 font-mono text-purple-600 dark:text-purple-400">{f.type}</td>
                            <td className="py-2 px-3 text-slate-500">{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {col.indexes && (
                    <div className="p-2.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                      Indexes: {col.indexes.join(' ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Firestore Security Rules Block */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">firestore.rules (Production RBAC & Isolation)</span>
              </div>
              <button
                onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.databaseSchema.firestoreSecurityRules, 'rules')}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-indigo-300">
              {ARCHITECTURE_BLUEPRINT.databaseSchema.firestoreSecurityRules}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Wireframes & Layout Map */}
      {activeTab === 'wireframes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Login */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">1. Student Login Screen</span>
              <span className="font-mono text-[10px] text-slate-400">/login/student</span>
            </div>
            <p className="text-slate-500">{ARCHITECTURE_BLUEPRINT.wireframes.studentLoginScreen.purpose}</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {ARCHITECTURE_BLUEPRINT.wireframes.studentLoginScreen.layout.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Faculty Login */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">2. Faculty Login Screen</span>
              <span className="font-mono text-[10px] text-slate-400">/login/faculty</span>
            </div>
            <p className="text-slate-500">{ARCHITECTURE_BLUEPRINT.wireframes.facultyLoginScreen.purpose}</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {ARCHITECTURE_BLUEPRINT.wireframes.facultyLoginScreen.layout.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Admin Login */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">3. Admin Login Screen</span>
              <span className="font-mono text-[10px] text-slate-400">/login/admin</span>
            </div>
            <p className="text-slate-500">{ARCHITECTURE_BLUEPRINT.wireframes.adminLoginScreen.purpose}</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {ARCHITECTURE_BLUEPRINT.wireframes.adminLoginScreen.layout.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Student Dashboard Layout */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-purple-600 dark:text-purple-400">4. Main Student Dashboard</span>
              <span className="font-mono text-[10px] text-slate-400">/dashboard/student</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {ARCHITECTURE_BLUEPRINT.wireframes.studentDashboard.sections.map((sec, i) => (
                <li key={i}>{sec}</li>
              ))}
            </ul>
          </div>

          {/* Faculty Dashboard Layout */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-teal-600 dark:text-teal-400">5. Faculty Dashboard</span>
              <span className="font-mono text-[10px] text-slate-400">/dashboard/faculty</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {ARCHITECTURE_BLUEPRINT.wireframes.facultyDashboard.sections.map((sec, i) => (
                <li key={i}>{sec}</li>
              ))}
            </ul>
          </div>

          {/* Admin Dashboard Layout */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-amber-600 dark:text-amber-400">6. Admin Dashboard</span>
              <span className="font-mono text-[10px] text-slate-400">/dashboard/admin</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {ARCHITECTURE_BLUEPRINT.wireframes.adminDashboard.sections.map((sec, i) => (
                <li key={i}>{sec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: User Flow Diagrams */}
      {activeTab === 'flows' && (
        <div className="space-y-6">
          {ARCHITECTURE_BLUEPRINT.userFlows.map((flow, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{flow.name}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {flow.steps.map((step, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                      Step {sIdx + 1}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: API Route Design */}
      {activeTab === 'api' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
          {ARCHITECTURE_BLUEPRINT.apiRoutes.map((cat, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {cat.category}
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {cat.routes.map((r, rIdx) => (
                  <div key={rIdx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        r.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        r.method === 'POST' ? 'bg-emerald-100 text-emerald-700' :
                        r.method === 'PATCH' || r.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {r.method}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{r.path}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">{r.desc}</span>
                      <span className="font-mono text-[10px] text-slate-400">{r.payload}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Code Structure Tree */}
      {activeTab === 'structure' && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Full Production Repository Folder Structure</span>
            </div>
            <button
              onClick={() => handleCopy(ARCHITECTURE_BLUEPRINT.codeStructure, 'code_struct')}
              className="p-1 text-slate-400 hover:text-white"
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
