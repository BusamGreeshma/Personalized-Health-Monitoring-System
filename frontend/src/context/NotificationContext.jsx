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

  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    const initCtx = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        setAudioCtx(ctx);
      } catch (err) {
        console.warn("Failed to pre-initialize AudioContext:", err);
      }
      window.removeEventListener('click', initCtx);
      window.removeEventListener('keydown', initCtx);
    };
    window.addEventListener('click', initCtx);
    window.addEventListener('keydown', initCtx);
    return () => {
      window.removeEventListener('click', initCtx);
      window.removeEventListener('keydown', initCtx);
    };
  }, []);

  const playNotificationSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = audioCtx || new AudioContext();
      
      const playChime = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'medication' || type === 'alert') {
          // Elegant medical reminder chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
          
          setTimeout(() => {
            try {
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
              gain2.gain.setValueAtTime(0.15, ctx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
              osc2.start(ctx.currentTime);
              osc2.stop(ctx.currentTime + 0.25);
            } catch (err) {}
          }, 150);
        } else if (type === 'success') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.25); // C6
          gain.gain.setValueAtTime(0.10, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume()
          .then(playChime)
          .catch(err => console.warn("Failed to resume suspended audio context:", err));
      } else {
        playChime();
      }
    } catch (e) {
      console.warn("Audio Context playback failed or blocked by browser gesture policies:", e);
    }
  };

  // Show an on-screen floating toast notification
  const showToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Play alert sound
    playNotificationSound(type);

    // Auto-remove toast after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [medications, setMedications] = useState([]);

  const fetchMedicationList = async () => {
    if (!user) return;
    try {
      const res = await api.get('/medications');
      if (res.data.success) {
        setMedications(res.data.data);
      }
    } catch (e) {
      console.error("Failed to retrieve medication schedule for alerts:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMedicationList();
      const interval = setInterval(fetchMedicationList, 3 * 60 * 1000); // 3 minutes list sync
      return () => clearInterval(interval);
    } else {
      setMedications([]);
    }
  }, [user]);

  const normalizeTimeTo24h = (timeStr) => {
    if (!timeStr) return '';
    try {
      const clean = timeStr.trim().toUpperCase();
      
      // Matches formats like "6:50PM", "06:50 PM", "18:50", "08:00 AM", "6:50"
      const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = match[3];
        
        if (ampm) {
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    } catch (e) {
      console.warn("Time normalization error:", e);
    }
    return timeStr;
  };

  // Background time checker for scheduled meds
  useEffect(() => {
    if (!user || medications.length === 0) return;

    const firedAlerts = new Set(JSON.parse(localStorage.getItem('firedMedAlerts') || '[]'));

    const checkScheduledReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hrs}:${mins}`; // "HH:MM"

      medications.forEach(med => {
        if (!med.remindersEnabled) return;

        med.times.forEach(time => {
          const normalizedTime = normalizeTimeTo24h(time);
          if (normalizedTime === currentTime) {
            const key = `${med._id}-${time}-${todayStr}`;
            if (!firedAlerts.has(key)) {
              firedAlerts.add(key);
              const list = Array.from(firedAlerts).slice(-100);
              localStorage.setItem('firedMedAlerts', JSON.stringify(list));

              // Trigger alert sound & banner toast!
              addNotification(
                'Medication Reminder',
                `Time to take your ${med.name} (${med.dosage}) dose.`,
                'medication'
              );
            }
          }
        });
      });
    };

    checkScheduledReminders();
    const ticker = setInterval(checkScheduledReminders, 20 * 1000); // Check every 20 seconds
    return () => clearInterval(ticker);
  }, [user, medications]);

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
        fetchNotifications,
        fetchMedicationList,
        medications
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
