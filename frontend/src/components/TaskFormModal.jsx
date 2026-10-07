import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Calendar, 
  Tag, 
  Flag, 
  HelpCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { aiService } from '../services/aiService';

const CATEGORIES = [
  'General',
  'Technical Issue',
  'Bug Fix',
  'Feature Request',
  'Documentation',
  'DevOps & Infra',
  'Security',
  'Customer Support'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export const TaskFormModal = ({ isOpen, onClose, onSubmit, initialTask = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium',
    status: 'Pending',
    due_date: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        category: initialTask.category || 'General',
        priority: initialTask.priority || 'Medium',
        status: initialTask.status || 'Pending',
        due_date: initialTask.due_date ? initialTask.due_date.slice(0, 16) : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'General',
        priority: 'Medium',
        status: 'Pending',
        due_date: ''
      });
    }
    setAiSuggestions(null);
    setAiError('');
    setValidationError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'title' && value.trim()) {
      setValidationError('');
    }
  };

  const handleAIAnalyze = async () => {
    if (!formData.title.trim()) {
      setValidationError('Please enter a task title before requesting AI analysis.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiSuggestions(null);

    try {
      const result = await aiService.analyzeTask(formData.title, formData.description);
      setAiSuggestions(result);
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'AI service temporarily unavailable. Please try again.';
      setAiError(errMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestions = () => {
    if (!aiSuggestions) return;

    // Apply priority and category
    setFormData((prev) => {
      let updatedDesc = prev.description;
      // If user hasn't added much description, enhance it with AI summary and next action
      if (!prev.description.trim() && aiSuggestions.summary) {
        updatedDesc = `${aiSuggestions.summary}\n\nRecommended Next Action:\n• ${aiSuggestions.next_action}`;
      }

      return {
        ...prev,
        priority: aiSuggestions.priority || prev.priority,
        category: aiSuggestions.category || prev.category,
        description: updatedDesc
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {initialTask ? `#${initialTask.id}` : 'Workflow item'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Payment webhook returning 500 error on checkout"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Context
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide background, steps to reproduce, or details for team collaboration..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* AI Assistance Action Section */}
          <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/80 border border-indigo-100 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Triage Assistant (Google Gemini)
                </div>
                <p className="text-xs text-indigo-950/70 mt-0.5">
                  Analyze title & description to suggest optimal priority, category, and actionable first step.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={aiLoading || !formData.title.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all shrink-0"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze with AI
                  </>
                )}
              </button>
            </div>

            {/* AI Error Alert */}
            {aiError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Suggestions Display Panel */}
            {aiSuggestions && (
              <div className="mt-3 bg-white border border-indigo-200 rounded-xl p-3.5 shadow-xs space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    AI Suggestions Ready
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    Source: {aiSuggestions.source || 'Gemini'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium block text-[11px]">Suggested Priority</span>
                    <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{aiSuggestions.priority}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium block text-[11px]">Suggested Category</span>
                    <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{aiSuggestions.category}</span>
                  </div>
                </div>

                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Summary: </span>
                    <span className="text-slate-700">{aiSuggestions.summary}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Next Action: </span>
                    <span className="text-slate-700 font-medium">{aiSuggestions.next_action}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={applyAISuggestions}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply Suggestions to Task
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : initialTask ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
