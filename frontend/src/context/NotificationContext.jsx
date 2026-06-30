import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // Mock fetch notifications or real API fetch if available
      // For demo, we seed initial notification logs on logon
      const mockNotifications = [
        {
          _id: 'n1',
          title: 'Medication Reminder',
          message: 'It is time to take your Vitamin D3 (1 tablet) dosage.',
          type: 'medication',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 20) // 20 mins ago
        },
        {
          _id: 'n2',
          title: 'Appointment Scheduled',
          message: 'Consultation with Dr. John Watson (Cardiologist) tomorrow at 10:00 AM.',
          type: 'appointment',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Show an on-screen floating toast notification
  const showToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);

    // Auto-remove toast after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (title, message, type = 'general') => {
    const newNotif = {
      _id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date()
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(title, message, type);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        showToast,
        removeToast,
        markAllRead,
        addNotification,
        fetchNotifications
      }}
    >
      {children}
      {/* Toast Overlay Renderer */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-md flex flex-col transition-all duration-300 transform translate-y-0 ${
              t.type === 'medication' || t.type === 'alert'
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
                : t.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700/50 text-slate-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-semibold text-sm">{t.title}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white text-xs ml-4 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs mt-1 text-slate-300">{t.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
