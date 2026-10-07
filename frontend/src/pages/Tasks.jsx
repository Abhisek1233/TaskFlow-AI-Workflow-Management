import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  RotateCcw, 
  LayoutGrid, 
  Table as TableIcon,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { TaskCard } from '../components/TaskCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskFormModal } from '../components/TaskFormModal';
import { AIAnalyzeModal } from '../components/AIAnalyzeModal';

const CATEGORIES = [
  'All',
  'General',
  'Technical Issue',
  'Bug Fix',
  'Feature Request',
  'Documentation',
  'DevOps & Infra',
  'Security',
  'Customer Support'
];

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAITriageOpen, setIsAITriageOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const data = await taskService.getTasks(params);
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
  };

  const handleCreateOrUpdateTask = async (taskPayload) => {
    try {
      setModalSubmitting(true);
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskPayload);
      } else {
        await taskService.createTask(taskPayload);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save task.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCreateFromAI = async (taskPayload) => {
    try {
      await taskService.createTask(taskPayload);
      await loadTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task from AI.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await loadTasks();
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Workflow Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, filter, and prioritize your development initiatives ({total} total tasks)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAITriageOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Triage
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent Priority</option>
            </select>
          </div>
        </div>

        {/* Category & Reset secondary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-xs text-slate-700 bg-slate-50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Task Content List / Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin mb-2 text-indigo-600" />
          <p className="text-xs">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No tasks match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing selected filters, or creating a new task.
          </p>
          <div className="flex justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Create New Task
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onViewDetails={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div 
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation & Editing Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={editingTask}
        isSubmitting={modalSubmitting}
      />

      {/* AI Triage Modal */}
      <AIAnalyzeModal
        isOpen={isAITriageOpen}
        onClose={() => setIsAITriageOpen(false)}
        onCreateFromAnalysis={handleCreateFromAI}
      />
    </div>
  );
};
