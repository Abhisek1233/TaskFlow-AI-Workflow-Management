import React from 'react';
import { 
  Calendar, 
  Tag, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  MoreVertical 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        {/* Top bar: Category + Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md">
            <Tag className="w-3 h-3 text-slate-400" />
            {task.category}
          </span>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onViewDetails(task)}
          className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
        >
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
          {task.description || 'No detailed description provided.'}
        </p>
      </div>

      {/* Footer Details & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {/* Due Date */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
          {task.due_date ? (
            <span className={isOverdue ? 'text-rose-600 font-semibold' : ''}>
              {formatDate(task.due_date)} {isOverdue && '(Overdue)'}
            </span>
          ) : (
            <span className="text-slate-400">No due date</span>
          )}
        </div>

        {/* Quick status toggle and actions */}
        <div className="flex items-center gap-2">
          {/* Quick status dropdown */}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
