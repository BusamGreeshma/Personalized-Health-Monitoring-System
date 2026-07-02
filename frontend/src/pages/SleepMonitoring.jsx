import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Moon, Plus, Check, Star, Sparkles, Coffee } from 'lucide-react';

const SleepMonitoring = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [sleeps, setSleeps] = useState([]);
  const [trends, setTrends] = useState([]);
  const [averages, setAverages] = useState({ duration: 0, quality: 0 });
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, reset } = useForm();

  const fetchSleepData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logs/summary/${todayStr}`);
      if (res.data.success) {
        setSleeps(res.data.data.sleepLogs || []);
      }

      // Trends
      const trendsRes = await api.get('/logs/trends/weekly');
      if (trendsRes.data.success) {
        const weeklyLogs = trendsRes.data.data || [];
        setTrends(weeklyLogs);

        // Calculate averages
        if (weeklyLogs.length > 0) {
          const sumDur = weeklyLogs.reduce((sum, log) => sum + (log.sleepHours || 0), 0);
          const avgDur = parseFloat((sumDur / weeklyLogs.length).toFixed(1));
          setAverages({ duration: avgDur, quality: 4 }); // Mock quality average
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        date: todayStr,
        duration: parseFloat(data.duration),
        quality: parseInt(data.quality),
        bedtime: data.bedtime,
        wakeupTime: data.wakeupTime
      };

      const res = await api.post('/logs/sleep', payload);
      if (res.data.success) {
        showToast('Sleep Logged', 'Sleep timeline and AI rest recommendations synced.', 'success');
        reset();
        fetchSleepData();
      }
    } catch (err) {
      showToast('Error', 'Failed to log sleep details.', 'alert');
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
        <h2 className="text-2xl font-bold tracking-tight">Sleep Monitoring</h2>
        <p className="text-xs text-slate-400">Track bedtime schedules and rest quality values to optimize recovery.</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sleep Duration */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
            <Moon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Sleep Duration</span>
            <p className="text-xl font-bold text-white mt-1">{averages.duration || '--'} hours / night</p>
          </div>
        </GlassCard>

        {/* Quality Rating */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/10">
            <Star size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Rest Quality</span>
            <p className="text-xl font-bold text-white mt-1">4.2 / 5.0 Rating</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: forms & charts */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Plus className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-sm">Add New Sleep Entry</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Sleep Duration (Hours)</label>
                <input type="number" step="0.1" placeholder="7.5" className="glass-input text-sm" {...register('duration', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Sleep Quality (1-5)</label>
                <select className="glass-input text-sm bg-slate-900" {...register('quality')}>
                  <option value="5">5 - Excellent Rest</option>
                  <option value="4">4 - Good Sleep</option>
                  <option value="3">3 - Light Restless</option>
                  <option value="2">2 - Poor Sleep</option>
                  <option value="1">1 - Extremely Restless</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Bedtime (HH:MM)</label>
                <input type="time" className="glass-input text-sm" {...register('bedtime', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Wake-up Time (HH:MM)</label>
                <input type="time" className="glass-input text-sm" {...register('wakeupTime', { required: true })} />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-3">
                <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Log Sleep</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Recharts Area Chart showing sleep duration trends */}
          <GlassCard hover={false} className="space-y-4">
            <h3 className="font-semibold text-sm">Weekly Sleep Recovery Trends</h3>
            <div className="h-64 w-full">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">No sleep trends data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#cbd5e1' }} />
                    <Area type="monotone" dataKey="sleepHours" name="Sleep Duration (hrs)" stroke="#818cf8" fillOpacity={1} fill="url(#colorSleep)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: AI Sleep Suggestions */}
        <div className="space-y-6">
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Sparkles className="text-indigo-400 animate-pulse" size={16} />
              <h3 className="font-semibold text-sm">AI Rest Suggestions</h3>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/10 text-[11px] text-amber-400 leading-relaxed flex gap-2">
              <Coffee size={16} className="flex-shrink-0" />
              <span>Caffeine consumed after 2 PM can delay melatonin release, decreasing REM sleep quality.</span>
            </div>

            <div className="space-y-3.5 pt-2">
              {sleeps.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">Log sleep to fetch AI feedback.</p>
              ) : (
                sleeps.map((log, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col gap-1 text-xs text-slate-300">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>Sleep Rating: {log.quality} ★</span>
                      <span className="text-[10px] text-slate-500">{log.bedtime} - {log.wakeupTime}</span>
                    </div>
                    <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">{log.suggestions}</p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default SleepMonitoring;
