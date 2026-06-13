import React from 'react';
import { Languages, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-emerald-500">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold tracking-tight text-slate-100 uppercase">
              UNIVERSAL SUBTITLE TRANSLATOR
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest">PRODUCTION GRADE UTILITY</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400 hover:text-slate-200 transition-colors cursor-help">
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs font-mono hidden sm:inline uppercase tracking-wider">Help Docs</span>
        </div>
      </div>
    </header>
  );
};
