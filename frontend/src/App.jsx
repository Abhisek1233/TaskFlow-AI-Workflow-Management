import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { AIAnalyzeModal } from './components/AIAnalyzeModal';
import { taskService } from './services/taskService';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { TaskDetails } from './pages/TaskDetails';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isAITriageOpen, setIsAITriageOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleCreateFromAI = async (taskPayload) => {
    try {
      await taskService.createTask(taskPayload);
      window.location.reload();
    } catch {
      alert('Failed to save AI generated task.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {isAuthenticated && !isAuthPage && (
        <Navbar 
          onOpenAITriage={() => setIsAITriageOpen(true)}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {isAuthenticated && !isAuthPage && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <p>
            TaskFlow — Workflow Management Platform • FastAPI, PostgreSQL & React
          </p>
        </footer>
      )}

      <AIAnalyzeModal
        isOpen={isAITriageOpen}
        onClose={() => setIsAITriageOpen(false)}
        onCreateFromAnalysis={handleCreateFromAI}
      />
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
};

export default App;
