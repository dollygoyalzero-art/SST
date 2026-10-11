import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

interface SearchStudyExplorerProps {
  targetExam: string;
}

export const SearchStudyExplorer: React.FC<SearchStudyExplorerProps> = ({ targetExam }) => {
  const [query, setQuery] = useState('Rotational Dynamics high weightage JEE Advanced questions');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    sources: Array<{ title: string; uri: string }>;
  } | null>(null);

  const handleSearch = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/search-grounded-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: q, exam: targetExam })
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          summary: data.summary,
          sources: data.sources || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const quickPills = [
    'Calculus weightage & question trend',
    'Organic chemistry named reactions list',
    'Rotational dynamics previous year cutoffs',
    'Optics formula sheet & derivation checklist'
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <span>Exam Resource Explorer</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Google Search Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Verified syllabus weightage, question distributions & official curriculum updates
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex space-x-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search topic weightage, PYQ patterns, or syllabus updates..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm flex items-center space-x-1.5"
        >
          {loading ? (
            <span>Grounding...</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Quick Topics */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => { setQuery(pill); handleSearch(pill); }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
          <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-3">
            {result.summary}
          </div>

          {result.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Verified Grounding Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
