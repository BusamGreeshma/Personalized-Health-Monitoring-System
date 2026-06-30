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
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white font-extrabold text-sm tracking-tighter">A</span>
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AURA</span>
          <span className="text-xs font-medium text-cyan-400 ml-1">HEALTH</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={idx}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/25 font-semibold'
                    : link.highlight
                    ? 'bg-rose-950/20 text-rose-400 border border-rose-500/10 hover:bg-rose-950/40 hover:text-rose-300'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <Icon size={16} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {/* Admin Dashboard link, only shown if user role is admin */}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-slate-800/60">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Administration</span>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/25 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <ShieldCheck size={16} className="text-cyan-500" />
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Gamification Streak Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/10">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Streak Calendar</p>
              <p className="text-xs font-bold text-slate-200">{user.streak || 0} Day Streak 🔥</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
