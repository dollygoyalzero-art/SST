import React from 'react';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            Meccademia Education Institute
          </span>
          <span>• Student Success Tracker</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span>JEE Advanced & NEET Excellence System</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Tenant Isolation</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
