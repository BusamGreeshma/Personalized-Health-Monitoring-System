import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, markAllRead } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <nav className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {user ? `${getGreeting()}, ${user.username}` : 'Welcome to Aura'}
        </h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          Your personal AI health intelligence system is active.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Toggle Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown && unreadCount > 0) markAllRead();
              }}
              className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all cursor-pointer relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-80 glass-panel p-4 z-40 shadow-2xl border-slate-700/50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 mb-2">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className="p-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/20 border border-slate-800/30 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-indigo-300">{n.title}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile and Logout */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-800/80 pl-4">
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            >
              {user.username.slice(0, 2).toUpperCase()}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
