import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DailyLogs from './pages/DailyLogs';
import AiAssistant from './pages/AiAssistant';
import RecommendationEngine from './pages/RecommendationEngine';
import RiskPrediction from './pages/RiskPrediction';
import MedicalReportAnalyzer from './pages/MedicalReportAnalyzer';
import NutritionTracker from './pages/NutritionTracker';
import FitnessModule from './pages/FitnessModule';
import SleepMonitoring from './pages/SleepMonitoring';
import MentalWellness from './pages/MentalWellness';
import MedicationReminder from './pages/MedicationReminder';
import AppointmentModule from './pages/AppointmentModule';
import WearableIntegration from './pages/WearableIntegration';
import EmergencyModule from './pages/EmergencyModule';
import ReportsPage from './pages/ReportsPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest">Aura is loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Pages */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Pages */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute><DailyLogs /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><RecommendationEngine /></ProtectedRoute>} />
              <Route path="/risk-prediction" element={<ProtectedRoute><RiskPrediction /></ProtectedRoute>} />
              <Route path="/report-analyzer" element={<ProtectedRoute><MedicalReportAnalyzer /></ProtectedRoute>} />
              <Route path="/nutrition" element={<ProtectedRoute><NutritionTracker /></ProtectedRoute>} />
              <Route path="/fitness" element={<ProtectedRoute><FitnessModule /></ProtectedRoute>} />
              <Route path="/sleep" element={<ProtectedRoute><SleepMonitoring /></ProtectedRoute>} />
              <Route path="/mental-wellness" element={<ProtectedRoute><MentalWellness /></ProtectedRoute>} />
              <Route path="/medications" element={<ProtectedRoute><MedicationReminder /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><AppointmentModule /></ProtectedRoute>} />
              <Route path="/wearables" element={<ProtectedRoute><WearableIntegration /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/emergency" element={<ProtectedRoute><EmergencyModule /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

              {/* Fallback to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
