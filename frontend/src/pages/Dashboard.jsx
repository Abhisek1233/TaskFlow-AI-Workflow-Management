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
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { StatCard } from '../components/StatCard';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { AIAnalyzeModal } from '../components/AIAnalyzeModal';

export const Dashboard = () => {
  const { user } = useAuth();
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
    } catch {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      await fetchData();
    } catch {
      alert('Failed to delete task.');
    }
  };

  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Clean, Professional Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back, {user?.name || 'Developer'}. Overview of your tasks and workflows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Analyze with AI Button */}
          <button
            type="button"
            onClick={() => setIsAITriageOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Analyze with AI
          </button>

          {/* Create Task Button */}
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Dashboard Metrics (5 target cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Tasks"
          value={stats.total_tasks}
          icon={CheckSquare}
          colorClass="bg-slate-100 text-slate-700"
          subtitle="All tasks"
        />
        <StatCard
          title="Pending"
          value={stats.pending_tasks}
          icon={Clock}
          colorClass="bg-amber-50 text-amber-700"
          subtitle="Awaiting action"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress_tasks}
          icon={PlayCircle}
          colorClass="bg-blue-50 text-blue-700"
          subtitle="Active work"
        />
        <StatCard
          title="Completed"
          value={stats.completed_tasks}
          icon={CheckCircle2}
          colorClass="bg-emerald-50 text-emerald-700"
          subtitle={`${completionRate}% resolved`}
        />
        <StatCard
          title="High Priority"
          value={stats.high_priority_tasks}
          icon={AlertTriangle}
          colorClass="bg-rose-50 text-rose-700"
          subtitle="Urgent & High items"
        />
      </div>

      {/* Progress Bar Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            Completion Progress
          </span>
          <span className="text-xs font-medium text-slate-500">
            {stats.completed_tasks} of {stats.total_tasks} tasks ({completionRate}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
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
        <div className="flex items-center gap-5 mt-2.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending</span>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Tasks</h2>
            <p className="text-xs text-slate-500">Latest active workflows and deliverables</p>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mb-2 text-indigo-600" />
            <p className="text-xs">Loading tasks...</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No tasks created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your first task, or use AI to analyze a problem description.
            </p>
            <div className="flex justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAITriageOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Analyze with AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
