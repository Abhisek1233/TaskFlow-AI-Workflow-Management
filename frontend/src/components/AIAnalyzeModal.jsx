import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  Flag 
} from 'lucide-react';
import { aiService } from '../services/aiService';

export const AIAnalyzeModal = ({ isOpen, onClose, onCreateFromAnalysis }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title or incident description.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await aiService.analyzeTask(title, description);
      setResult(data);
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'AI service temporarily unavailable. Please verify network or API key.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    if (!result) return;
    onCreateFromAnalysis({
      title: title.trim(),
      description: description.trim() 
        ? `${description.trim()}\n\nAI Summary: ${result.summary}\nNext Step: ${result.next_action}` 
        : `${result.summary}\n\nRecommended Action:\n• ${result.next_action}`,
      priority: result.priority,
      category: result.category,
      status: 'Pending'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Workflow Triage</h2>
              <p className="text-xs text-indigo-200">Powered by Google Gemini REST API</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Paste raw bug reports, client requests, or operational issues. Gemini extracts urgency, classifies category, synthesizes a summary, and formulates the immediate next action.
          </p>

          <form onSubmit={handleAnalyze} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Issue / Objective <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Users report timeout on checkout payment gateway"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Context / Error Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Logs, customer complaints, or background context..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing context with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run AI Triage Analysis
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Structured Analysis
                </span>
                <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {result.source || 'Gemini'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">Suggested Priority</span>
                  <span className="font-bold text-slate-800 text-sm">{result.priority}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">Suggested Category</span>
                  <span className="font-bold text-slate-800 text-sm">{result.category}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Executive Summary</span>
                  <p className="text-slate-800 mt-0.5">{result.summary}</p>
                </div>
                <div className="pt-1.5 border-t border-slate-100">
                  <span className="font-semibold text-indigo-600 block text-[10px] uppercase">Actionable Next Step</span>
                  <p className="text-slate-900 font-medium mt-0.5">{result.next_action}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateTask}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Create Task with These AI Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
