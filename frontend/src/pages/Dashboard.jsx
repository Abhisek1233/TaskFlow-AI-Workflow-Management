import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { StatCard } from '../components/StatCard';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { AIAnalyzeModal } from '../components/AIAnalyzeModal';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    high_priority_tasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAITriageOpen, setIsAITriageOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData] = await Promise.all([
        taskService.getDashboardStats(),
        taskService.getTasks({ limit: 6 })
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.tasks || []);
      setError('');
    } catch (err) {
      setError('Unable to load dashboard data. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save task.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCreateFromAI = async (taskPayload) => {
    try {
      await taskService.createTask(taskPayload);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task from AI suggestions.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await fetchData();
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      await fetchData();
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Forward Deployed AI Workflow Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TaskFlow Overview
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-xl">
              Track priority deliverables, monitor development lifecycle states, and triage incoming tasks with Google Gemini AI.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Analyze with AI Button (Explicitly required in spec) */}
            <button
              type="button"
              onClick={() => setIsAITriageOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Analyze with AI
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-slate-700" />
              Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics (5 target cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.total_tasks}
          icon={CheckSquare}
          colorClass="bg-slate-100 text-slate-700"
          subtitle="All assigned tasks"
        />
        <StatCard
          title="Pending"
          value={stats.pending_tasks}
          icon={Clock}
          colorClass="bg-amber-100 text-amber-700"
          subtitle="Awaiting start"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress_tasks}
          icon={PlayCircle}
          colorClass="bg-blue-100 text-blue-700"
          subtitle="Active workflows"
        />
        <StatCard
          title="Completed"
          value={stats.completed_tasks}
          icon={CheckCircle2}
          colorClass="bg-emerald-100 text-emerald-700"
          subtitle={`${completionRate}% resolution`}
        />
        <StatCard
          title="High Priority"
          value={stats.high_priority_tasks}
          icon={AlertTriangle}
          colorClass="bg-rose-100 text-rose-700"
          subtitle="High & Urgent items"
        />
      </div>

      {/* Progress Bar Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Workflow Completion Progress
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {stats.completed_tasks} of {stats.total_tasks} tasks ({completionRate}%)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${stats.total_tasks > 0 ? (stats.completed_tasks / stats.total_tasks) * 100 : 0}%` }} 
            className="bg-emerald-500 transition-all duration-500" 
            title="Completed"
          />
          <div 
            style={{ width: `${stats.total_tasks > 0 ? (stats.in_progress_tasks / stats.total_tasks) * 100 : 0}%` }} 
            className="bg-blue-500 transition-all duration-500" 
            title="In Progress"
          />
          <div 
            style={{ width: `${stats.total_tasks > 0 ? (stats.pending_tasks / stats.total_tasks) * 100 : 0}%` }} 
            className="bg-amber-400 transition-all duration-500" 
            title="Pending"
          />
        </div>
        <div className="flex items-center gap-5 mt-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pending</span>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Tasks</h2>
            <p className="text-xs text-slate-500">Latest active workflows and deliverables</p>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            View All Tasks
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
            <p className="text-xs">Loading recent workflows...</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No tasks created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your first task, or analyze an incident report with AI to automatically classify urgency.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAITriageOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze with AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTasks.map((task) => (
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
        )}
      </div>

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

      {/* Standalone AI Triage Modal */}
      <AIAnalyzeModal
        isOpen={isAITriageOpen}
        onClose={() => setIsAITriageOpen(false)}
        onCreateFromAnalysis={handleCreateFromAI}
      />
    </div>
  );
};
