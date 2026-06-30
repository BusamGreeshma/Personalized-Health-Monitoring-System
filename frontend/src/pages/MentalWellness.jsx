import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { Heart, Plus, Check, Play, Square, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MentalWellness = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [moodLogs, setMoodLogs] = useState([]);
  const [saving, setSaving] = useState(false);

  // Breathing Box States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathState, setBreathState] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [breathTimer, setBreathTimer] = useState(4);

  const todayStr = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, reset } = useForm();

  const fetchWellnessLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logs/summary/${todayStr}`);
      if (res.data.success) {
        setMoodLogs(res.data.data.moodLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellnessLogs();
  }, []);

  // Box Breathing Loop: 4s Inhale, 4s Hold, 4s Exhale, 4s Hold
  useEffect(() => {
    let interval = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathTimer(prev => {
          if (prev === 1) {
            setBreathState(curr => {
              if (curr === 'Inhale') return 'Hold (Full)';
              if (curr === 'Hold (Full)') return 'Exhale';
              if (curr === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathState('Inhale');
      setBreathTimer(4);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        date: todayStr,
        mood: data.mood,
        stressLevel: parseInt(data.stressLevel),
        anxietyLevel: parseInt(data.anxietyLevel),
        notes: data.notes
      };

      const res = await api.post('/logs/mood', payload);
      if (res.data.success) {
        showToast('Mood Logged', 'Mental wellness metrics recorded successfully.', 'success');
        reset();
        fetchWellnessLogs();
      }
    } catch (err) {
      showToast('Error', 'Failed to log mood details.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-44" className="mt-8" />;
  }

  // Animation variants for breathing bubble
  const bubbleVariants = {
    Inhale: { scale: 1.4, backgroundColor: 'rgba(99, 102, 241, 0.45)' },
    'Hold (Full)': { scale: 1.4, backgroundColor: 'rgba(6, 182, 212, 0.45)' },
    Exhale: { scale: 0.9, backgroundColor: 'rgba(99, 102, 241, 0.2)' },
    'Hold (Empty)': { scale: 0.9, backgroundColor: 'rgba(244, 63, 94, 0.15)' }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mental Wellness & Stress Control</h2>
        <p className="text-xs text-slate-400">Track anxiety metrics, log mental journals, and perform Box Breathing exercises.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Forms & Logs */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Plus className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-sm">Add New Wellness Journal</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Mood State</label>
                <select className="glass-input text-sm bg-slate-900" {...register('mood')}>
                  <option value="happy">Happy & Content</option>
                  <option value="neutral">Neutral & Stable</option>
                  <option value="stressed">Stressed</option>
                  <option value="anxious">Anxious</option>
                  <option value="sad">Sad / Depressed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Stress (1-10)</label>
                  <input type="number" min="1" max="10" placeholder="2" className="glass-input text-sm" {...register('stressLevel', { required: true })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Anxiety (1-10)</label>
                  <input type="number" min="1" max="10" placeholder="2" className="glass-input text-sm" {...register('anxietyLevel', { required: true })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-slate-400">Mood Journal Notes</label>
                <textarea rows="3" placeholder="Write any notes about stressors or triggers..." className="glass-input text-sm resize-none" {...register('notes')} />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-3">
                <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Log Mental State</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* History */}
          <GlassCard hover={false} className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Today's Mood Journal</span>
            {moodLogs.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-6 text-center">No wellness logs entered today.</p>
            ) : (
              <div className="divide-y divide-slate-900">
                {moodLogs.map(m => (
                  <div key={m._id} className="py-4 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center text-slate-200">
                      <div>
                        <span className="font-bold capitalize">{m.mood}</span>
                        <span className="text-slate-500 ml-2">Stress: {m.stressLevel}/10, Anxiety: {m.anxietyLevel}/10</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {m.notes && <p className="text-slate-400 leading-relaxed bg-slate-950/20 border border-slate-900/80 p-3 rounded-xl italic">{m.notes}</p>}
                    
                    {/* Render recommendations */}
                    {m.suggestions?.length > 0 && (
                      <div className="space-y-1.5 mt-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Aura Wellness Exercises</span>
                        {m.suggestions.map((s, idx) => (
                          <div key={idx} className="flex gap-2 text-[11px] text-indigo-300">
                            <span>✦</span>
                            <p>{s}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Breathing Exercise */}
        <div className="space-y-6">
          <GlassCard hover={false} className="flex flex-col items-center p-8 text-center border-slate-800/80">
            <Heart className="text-rose-500 animate-pulse-slow mb-4" size={24} />
            <h3 className="font-semibold text-sm">Guided Box Breathing</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Box Breathing triggers the parasympathetic nervous system, decreasing systemic cortisol and heart rate loads.
            </p>

            {/* Interactive Breathing Area */}
            <div className="h-60 w-full flex items-center justify-center relative my-6">
              <motion.div
                animate={breathingActive ? breathState : 'Exhale'}
                variants={bubbleVariants}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="w-36 h-36 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex flex-col items-center justify-center backdrop-blur-sm"
              >
                <span className="text-xs font-bold text-white uppercase tracking-wider">{breathState}</span>
                {breathingActive && (
                  <span className="text-2xl font-extrabold text-white mt-1">{breathTimer}s</span>
                )}
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="w-full">
              {breathingActive ? (
                <button
                  onClick={() => setBreathingActive(false)}
                  className="w-full glass-btn-secondary py-2.5 text-xs flex items-center justify-center gap-2 border-rose-500/20 hover:bg-rose-950/20 hover:text-rose-400 cursor-pointer"
                >
                  <Square size={12} />
                  <span>Stop Practice</span>
                </button>
              ) : (
                <button
                  onClick={() => setBreathingActive(true)}
                  className="w-full glass-btn-primary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={12} />
                  <span>Start 4-4-4 Practice</span>
                </button>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default MentalWellness;
