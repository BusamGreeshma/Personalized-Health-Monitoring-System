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
    <nav className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-slate-850 dark:text-slate-100">
            {user ? `${getGreeting()}, ${user.username}` : 'Welcome to Aura'}
          </h1>
        </div>
        {user && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-550/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Synced
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
          title="Toggle Mode"
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown && unreadCount > 0) markAllRead();
              }}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer relative"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-slate-950 dark:ring-slate-950 animate-pulse" />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-80 glass-panel p-4 z-40 shadow-2xl border-slate-200 dark:border-slate-700/50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800/60 mb-2">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-200">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-4">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/20 border border-slate-150 dark:border-slate-850 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[10px] text-indigo-600 dark:text-indigo-300">{n.title}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5">{n.message}</p>
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
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800/80 pl-4">
            <button
              onClick={() => navigate('/profile')}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center justify-center text-slate-750 dark:text-slate-200 text-[10px] font-bold cursor-pointer transition-all"
            >
              {user.username.slice(0, 2).toUpperCase()}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
