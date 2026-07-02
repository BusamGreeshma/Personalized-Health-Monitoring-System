import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  FileSpreadsheet,
  Apple,
  Activity,
  Moon,
  Heart,
  Pill,
  Calendar,
  AlertOctagon,
  Watch,
  ShieldCheck,
  Award,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/logs', label: 'Daily Logs', icon: ClipboardList },
    { to: '/ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/risk-prediction', label: 'Risk Predictions', icon: ShieldAlert },
    { to: '/report-analyzer', label: 'Report Analyzer', icon: FileSpreadsheet },
    { to: '/nutrition', label: 'Nutrition Tracker', icon: Apple },
    { to: '/fitness', label: 'Fitness Tracker', icon: Activity },
    { to: '/sleep', label: 'Sleep Monitor', icon: Moon },
    { to: '/mental-wellness', label: 'Mental Wellness', icon: Heart },
    { to: '/medications', label: 'Medications', icon: Pill },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/wearables', label: 'Wearable Sync', icon: Watch },
    { to: '/reports', label: 'Clinical Reports', icon: FileText },
    { to: '/emergency', label: 'Emergency SOS', icon: AlertOctagon, highlight: true }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/80 flex flex-col h-screen fixed left-0 top-0 z-20 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/80 gap-2.5">
        <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xs">A</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-slate-800 dark:text-slate-200">AURA</span>
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase -mt-0.5">Health suite</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={idx}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-semibold'
                    : link.highlight
                    ? 'bg-rose-500/10 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 dark:hover:bg-rose-950/20 hover:text-rose-700 dark:hover:text-rose-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-205'
                }`
              }
            >
              <Icon size={14} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {/* Admin Dashboard link, only shown if user role is admin */}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-900">
            <span className="px-3.5 text-[9px] uppercase font-semibold text-slate-450 dark:text-slate-500 tracking-wider">Administration</span>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 mt-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800 font-semibold'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-205'
                }`
              }
            >
              <ShieldCheck size={14} className="text-cyan-500" />
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Wellness Streak Footer */}
      {user && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900">
            <div className="p-2 rounded bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20">
              <Award size={14} />
            </div>
            <div>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 tracking-widest font-semibold uppercase">Active Streak</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{user.streak || 0} consecutive days</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
