import React from 'react';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          Low
        </span>
      );
  }
};
