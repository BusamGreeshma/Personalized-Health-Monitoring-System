import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Plus, Check, Sparkles, Flame, Clock, Award } from 'lucide-react';

const FitnessModule = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, duration: 0, count: 0 });
  const [trends, setTrends] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, reset } = useForm();

  const fetchFitnessData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logs/summary/${todayStr}`);
      if (res.data.success) {
        const loggedWorkouts = res.data.data.workouts || [];
        setWorkouts(loggedWorkouts);

        // Sum active values
        let cal = 0, mins = 0;
        loggedWorkouts.forEach(w => {
          cal += w.caloriesBurned || 0;
          mins += w.duration || 0;
        });
        setTotals({ calories: cal, duration: mins, count: loggedWorkouts.length });
      }

      // Load trends for chart
      const trendsRes = await api.get('/logs/trends/weekly');
      if (trendsRes.data.success) {
        setTrends(trendsRes.data.data);
      }

      // Load AI suggestions from plan recommendations
      const recsRes = await api.get('/ai/recommendations');
      if (recsRes.data.success) {
        setAiSuggestions(recsRes.data.data.workoutPlan || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFitnessData();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        date: todayStr,
        activityType: data.activityType,
        duration: parseInt(data.duration),
        distance: parseFloat(data.distance || 0),
        caloriesBurned: parseInt(data.caloriesBurned)
      };

      const res = await api.post('/logs/fitness', payload);
      if (res.data.success) {
        showToast('Workout Logged', 'Exercise recorded and synced with calories metrics.', 'success');
        reset();
        fetchFitnessData(); // Refresh list & totals
      }
    } catch (err) {
      showToast('Error', 'Failed to log workout session.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-44" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Fitness Tracker</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Record calorie burners and structured activities to keep cardiovascular health high.</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Calories Card */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Calories</span>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{totals.calories} kcal burned</p>
          </div>
        </GlassCard>

        {/* Minutes Card */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Minutes</span>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{totals.duration} minutes total</p>
          </div>
        </GlassCard>

        {/* Workouts count Card */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Exercise Sessions</span>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{totals.count} logged sessions</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: forms & list */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Plus className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-sm">Log Exercise Session</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">Activity Type</label>
                <select className="glass-input text-sm bg-slate-100 dark:bg-slate-900" {...register('activityType')}>
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="gym">Gym Workout</option>
                  <option value="other">Other Exercise</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">Duration (Minutes)</label>
                <input type="number" placeholder="30" className="glass-input text-sm" {...register('duration', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">Distance (km) (Optional)</label>
                <input type="number" step="0.01" placeholder="2.5" className="glass-input text-sm" {...register('distance')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">Calories Burned (kcal)</label>
                <input type="number" placeholder="220" className="glass-input text-sm" {...register('caloriesBurned', { required: true })} />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-3">
                <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Log Workout</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Recharts Bar chart for fitness totals */}
          <GlassCard hover={false} className="space-y-4">
            <h3 className="font-semibold text-sm">Weekly Activity History</h3>
            <div className="h-64 w-full">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">No trends data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#cbd5e1' }} />
                    <Bar dataKey="caloriesBurned" name="Calories Burned (kcal)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: AI Suggestions */}
        <div className="space-y-6">
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Sparkles className="text-indigo-400 animate-pulse" size={16} />
              <h3 className="font-semibold text-sm">AI Workout Recommendations</h3>
            </div>

            {aiSuggestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Complete profile targets to generate suggestions.</p>
            ) : (
              <div className="space-y-3.5">
                {aiSuggestions.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.exercise}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Intensity: {item.intensity}</p>
                    </div>
                    <span className="badge-success">{item.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default FitnessModule;
