import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { SetupAdmin } from './pages/SetupAdmin';
import { Dashboard } from './pages/Dashboard';
import { LeadsCRM } from './pages/LeadsCRM';
import { Campaigns } from './pages/Campaigns';
import { Traffic } from './pages/Traffic';
import { Instagram } from './pages/Instagram';
import { EditorialCalendar } from './pages/EditorialCalendar';
import { Automations } from './pages/Automations';
import { Reports } from './pages/Reports';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-semibold text-sm">
        Carregando sessão segura...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public / Setup Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/setup-admin" element={<SetupAdmin />} />

      {/* Protected SaaS Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <LeadsCRM />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/traffic"
        element={
          <ProtectedRoute>
            <Traffic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instagram"
        element={
          <ProtectedRoute>
            <Instagram />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editorial"
        element={
          <ProtectedRoute>
            <EditorialCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automations"
        element={
          <ProtectedRoute>
            <Automations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
