import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Heart, Activity, Droplet, Moon, Flame, Wind, Scale, Milestone, Sparkles, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch daily summary
      const summaryRes = await api.get(`/logs/summary/${todayStr}`);
      if (summaryRes.data.success) {
        setVitals(summaryRes.data.data.summary);
      }

      // 2. Fetch trends
      const trendsRes = await api.get('/logs/trends/weekly');
      if (trendsRes.data.success) {
        setTrends(trendsRes.data.data);
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
      showToast('Data Error', 'Failed to retrieve health logs summary.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIHealthScore = async () => {
    try {
      setScoreLoading(true);
      const scoreRes = await api.get('/ai/health-score');
      if (scoreRes.data.success) {
        setHealthScore(scoreRes.data.data);
      }
    } catch (err) {
      console.error("AI health score failed:", err);
    } finally {
      setScoreLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAIHealthScore();
  }, []);

  const handleWearableSync = async () => {
    setSyncing(true);
    try {
      const syncRes = await api.post('/logs/sync-wearable', { date: todayStr });
      if (syncRes.data.success) {
        showToast('Wearable Synced', 'Biometrics updated from simulated Google Fit/Fitbit.', 'success');
        setVitals(syncRes.data.data);
        // Refresh trends
        const trendsRes = await api.get('/logs/trends/weekly');
        if (trendsRes.data.success) {
          setTrends(trendsRes.data.data);
        }
        // Refresh Health Score
        fetchAIHealthScore();
      }
    } catch (error) {
      showToast('Sync Error', 'Failed to synchronize simulated biometrics.', 'alert');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={6} height="h-32" className="mt-8" />;
  }

  // Calculate percentage helper
  const getPercent = (val, max) => Math.min(Math.round((val / max) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Overview</h2>
          <p className="text-xs text-slate-400">Biometrics and wellness summary for today, {todayStr}</p>
        </div>
        <button
          onClick={handleWearableSync}
          disabled={syncing}
          className="glass-btn-secondary py-2 px-3.5 text-xs flex items-center gap-2"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync Wearable Data'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Targets Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Targets Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Steps Progress */}
            <GlassCard hover={false} className="p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-indigo-400">
                <Milestone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Daily Steps</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{vitals?.stepCount || 0}</span>
                  <span className="text-xs text-slate-500">/ 8,000 steps</span>
                </div>
                {/* ProgressBar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercent(vitals?.stepCount || 0, 8000)}%` }}
                  />
                </div>
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-500">
                {getPercent(vitals?.stepCount || 0, 8000)}%
              </span>
            </GlassCard>

            {/* Hydration Progress */}
            <GlassCard hover={false} className="p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-sky-400">
                <Droplet size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Hydration</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{vitals?.waterIntake || 0}</span>
                  <span className="text-xs text-slate-500">/ 2,500 ml</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercent(vitals?.waterIntake || 0, 2500)}%` }}
                  />
                </div>
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-500">
                {getPercent(vitals?.waterIntake || 0, 2500)}%
              </span>
            </GlassCard>

            {/* Calories Burned Progress */}
            <GlassCard hover={false} className="p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-rose-400">
                <Flame size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Calories Burned</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{vitals?.caloriesBurned || 0}</span>
                  <span className="text-xs text-slate-500">/ 500 kcal</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercent(vitals?.caloriesBurned || 0, 500)}%` }}
                  />
                </div>
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-500">
                {getPercent(vitals?.caloriesBurned || 0, 500)}%
              </span>
            </GlassCard>

            {/* Sleep Progress */}
            <GlassCard hover={false} className="p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-violet-400">
                <Moon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Sleep Duration</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{vitals?.sleepHours || 0}</span>
                  <span className="text-xs text-slate-500">/ 8 hrs</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-violet-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercent(vitals?.sleepHours || 0, 8)}%` }}
                  />
                </div>
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-500">
                {getPercent(vitals?.sleepHours || 0, 8)}%
              </span>
            </GlassCard>
          </div>

          {/* Vitals Secondary Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Heart Rate */}
            <GlassCard hover={false} className="p-4 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-rose-500">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Heart Rate</span>
                <Heart size={16} />
              </div>
              <div>
                <span className="text-xl font-bold">{vitals?.heartRate || '--'}</span>
                <span className="text-[10px] text-slate-400 ml-1">bpm</span>
              </div>
            </GlassCard>

            {/* Blood Pressure */}
            <GlassCard hover={false} className="p-4 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-cyan-500">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blood Pressure</span>
                <Activity size={16} />
              </div>
              <div>
                <span className="text-xl font-bold">{vitals?.bloodPressure?.systolic}/{vitals?.bloodPressure?.diastolic}</span>
                <span className="text-[10px] text-slate-400 ml-1">mmHg</span>
              </div>
            </GlassCard>

            {/* Blood Sugar */}
            <GlassCard hover={false} className="p-4 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-amber-500">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blood Sugar</span>
                <Flame size={16} />
              </div>
              <div>
                <span className="text-xl font-bold">{vitals?.bloodSugar || '--'}</span>
                <span className="text-[10px] text-slate-400 ml-1">mg/dL</span>
              </div>
            </GlassCard>

            {/* Oxygen Level */}
            <GlassCard hover={false} className="p-4 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-emerald-500">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Oxygen Vitals</span>
                <Wind size={16} />
              </div>
              <div>
                <span className="text-xl font-bold">{vitals?.oxygenLevel || '--'}</span>
                <span className="text-[10px] text-slate-400 ml-1">% SpO2</span>
              </div>
            </GlassCard>

          </div>

          {/* Recharts Area Plot Vitals Trends */}
          <GlassCard hover={false} className="space-y-4">
            <h3 className="font-semibold text-sm">Heart Rate & Step Trends (Recent 7 Logs)</h3>
            <div className="h-64 w-full">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                  No trend data available. Start daily health logging.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#cbd5e1' }} />
                    <Area type="monotone" dataKey="stepCount" name="Steps" stroke="#6366f1" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={2} />
                    <Area type="monotone" dataKey="heartRate" name="Heart Rate (Bpm)" stroke="#f43f5e" fillOpacity={0} strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Right Column: AI Health Score & Vitals Diagnostics */}
        <div className="space-y-8">
          
          {/* Health Score circle widget */}
          <GlassCard hover={false} className="flex flex-col items-center p-8 text-center relative">
            <div className="absolute top-4 right-4 text-slate-400">
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            </div>
            
            <h3 className="font-semibold text-sm mb-6 text-slate-300">AI-Generated Health Score</h3>

            {scoreLoading ? (
              <div className="w-36 h-36 flex items-center justify-center">
                <span className="w-8 h-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* SVG Circular score bar */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="url(#scoreGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={376.9}
                    strokeDashoffset={376.9 - (376.9 * (healthScore?.score || 70)) / 100}
                    strokeLinecap="round"
                    className="glow-ring transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold tracking-tighter text-white">{healthScore?.score || 72}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Perfect</span>
                </div>
              </div>
            )}

            {/* Vitals Diagnostics Bullet Points */}
            <div className="w-full text-left space-y-4 mt-8 pt-6 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strengths</span>
                <ul className="text-xs text-emerald-400 space-y-1 mt-1 list-disc list-inside">
                  {healthScore?.explanation?.strengths?.map((s, i) => <li key={i}>{s}</li>) || (
                    <li>Logs tracking is stable</li>
                  )}
                </ul>
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Warning Areas</span>
                <ul className="text-xs text-rose-400 space-y-1 mt-1 list-disc list-inside">
                  {healthScore?.explanation?.warnings?.map((w, i) => <li key={i}>{w}</li>) || (
                    <li>Rest parameters can be improved</li>
                  )}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recommendations</span>
                <ul className="text-xs text-cyan-400 space-y-1 mt-1 list-disc list-inside">
                  {healthScore?.explanation?.improvements?.map((im, i) => <li key={i}>{im}</li>) || (
                    <li>Sync fit band steps regularly</li>
                  )}
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Vitals BMI panel */}
          <GlassCard hover={false} className="flex justify-between items-center p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                <Scale size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Body Mass Index</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{vitals?.weight || user?.profile?.weight} kg • BMI {vitals?.bmi}</p>
              </div>
            </div>
            <span className="badge-success">
              {vitals?.bmi < 18.5 ? 'Underweight' : vitals?.bmi < 25 ? 'Normal' : vitals?.bmi < 30 ? 'Overweight' : 'Obese'}
            </span>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
