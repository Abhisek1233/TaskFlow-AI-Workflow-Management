import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  CheckSquare, 
  LogOut, 
  User as UserIcon,
  Zap
} from 'lucide-react';

export const Navbar = ({ onOpenAITriage, onOpenCreateTask }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  AI-Assisted
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-slate-100 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-slate-100 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Tasks
              </Link>
            </nav>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick AI Analyze Button */}
            {onOpenAITriage && (
              <button
                type="button"
                onClick={onOpenAITriage}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Triage
              </button>
            )}

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || 'Developer'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-none">{user?.email}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
