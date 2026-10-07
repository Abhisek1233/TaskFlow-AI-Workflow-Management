import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  Tag, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { aiService } from '../services/aiService';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskFormModal } from '../components/TaskFormModal';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI analysis
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTaskById(id);
      setTask(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Task not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleAIAnalyze = async () => {
    if (!task) return;
    setAiLoading(true);
    try {
      const result = await aiService.analyzeTask(task.title, task.description || '');
      setAiAnalysis(result);
    } catch (err) {
      alert('AI triage is currently unavailable. Please verify API key or network.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setIsSubmitting(true);
      const updated = await taskService.updateTask(task.id, payload);
      setTask(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(task.id);
      navigate('/tasks');
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(task.id, newStatus);
      setTask(updated);
    } catch {
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
        <p className="text-sm">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Task Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'This task could not be retrieved.'}</p>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-md">
              #{task.id} • {task.category}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-snug">
            {task.title}
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">
            Created on {new Date(task.created_at).toLocaleString()} • Last updated {new Date(task.updated_at).toLocaleString()}
          </p>
        </div>

        {/* Description Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description & Context
          </h2>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {task.description || 'No detailed description was provided for this task.'}
          </div>
        </div>

        {/* Due Date Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Due Date: </span>
          <span className="font-semibold text-slate-800">
            {task.due_date ? new Date(task.due_date).toLocaleString() : 'No deadline set'}
          </span>
        </div>

        {/* AI Assistance Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-blue-50/80 border border-indigo-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Gemini AI Advisory
                </div>
                <p className="text-xs text-indigo-950/70 mt-0.5">
                  Generate contextual suggestions for triage, priority alignment, and next action.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs disabled:opacity-50 shrink-0"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze with AI
                  </>
                )}
              </button>
            </div>

            {/* AI Results */}
            {aiAnalysis && (
              <div className="mt-4 bg-white rounded-xl border border-indigo-200 p-4 space-y-3 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase">Analysis Findings</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {aiAnalysis.source || 'Gemini'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Priority</span>
                    <p className="font-bold text-slate-800">{aiAnalysis.priority}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Category</span>
                    <p className="font-bold text-slate-800">{aiAnalysis.category}</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="font-semibold text-slate-500 uppercase text-[10px]">Summary:</span>
                    <p className="text-slate-800 mt-0.5">{aiAnalysis.summary}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="font-semibold text-indigo-600 uppercase text-[10px]">Recommended Next Action:</span>
                    <p className="text-slate-900 font-medium mt-0.5">{aiAnalysis.next_action}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialTask={task}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
