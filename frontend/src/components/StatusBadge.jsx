import React from 'react';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <PlayCircle className="w-3.5 h-3.5" />
          In Progress
        </span>
      );
    case 'Pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
  }
};
