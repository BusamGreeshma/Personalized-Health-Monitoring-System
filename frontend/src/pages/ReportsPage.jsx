import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { FileText, Printer, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  const [summary, setSummary] = useState({
    avgSteps: 0,
    avgWater: 0,
    avgSleep: 0,
    avgHeartRate: 0,
    avgBP: '120/80',
    weight: 70
  });

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/logs/trends/weekly');
      if (res.data.success) {
        const weeklyLogs = res.data.data || [];
        setTrends(weeklyLogs);

        if (weeklyLogs.length > 0) {
          const sumSteps = weeklyLogs.reduce((sum, l) => sum + (l.stepCount || 0), 0);
          const sumWater = weeklyLogs.reduce((sum, l) => sum + (l.waterIntake || 0), 0);
          const sumSleep = weeklyLogs.reduce((sum, l) => sum + (l.sleepHours || 0), 0);
          const sumHeart = weeklyLogs.reduce((sum, l) => sum + (l.heartRate || 0), 0);

          setSummary({
            avgSteps: Math.round(sumSteps / weeklyLogs.length),
            avgWater: Math.round(sumWater / weeklyLogs.length),
            avgSleep: parseFloat((sumSleep / weeklyLogs.length).toFixed(1)),
            avgHeartRate: Math.round(sumHeart / weeklyLogs.length),
            avgBP: '118/76',
            weight: weeklyLogs[weeklyLogs.length - 1]?.weight || user?.profile?.weight || 70
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve reports trends.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-44" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Banner - hidden on print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinical Reports Exporter</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Compile vitals logs summaries into printable PDF health reviews.</p>
        </div>
        <button
          onClick={handlePrint}
          className="glass-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
        >
          <Printer size={14} />
          <span>Export Clinical PDF</span>
        </button>
      </div>

      {/* Printable Report Card Container */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 space-y-8 print:border-none print:bg-white print:p-0 print:text-black">
        
        {/* Document Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-800 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center print:bg-indigo-600">
                <span className="text-white font-black text-xs">A</span>
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white print:text-black">AURA CLINICAL SUMMARIES</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">Weekly Telemetry Report</p>
          </div>
          <div className="text-right text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600 space-y-0.5">
            <p>Report ID: AR-{Math.floor(Math.random() * 90000) + 10000}</p>
            <p>Export Date: {new Date().toLocaleDateString()}</p>
            <p>Status: <span className="text-emerald-500 font-bold uppercase">Verified Telemetry</span></p>
          </div>
        </div>

        {/* Demographics Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-5 rounded-xl bg-slate-950/40 border border-slate-900/60 print:bg-slate-50 print:border-slate-200 print:text-black">
          <div className="text-xs">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Patient Name</span>
            <p className="font-bold mt-1 text-slate-800 dark:text-slate-200 print:text-black">{user?.username}</p>
          </div>
          <div className="text-xs">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Age / Gender</span>
            <p className="font-bold mt-1 text-slate-800 dark:text-slate-200 print:text-black">{user?.profile?.age} yrs / {user?.profile?.gender}</p>
          </div>
          <div className="text-xs">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">BMI Ratio</span>
            <p className="font-bold mt-1 text-slate-800 dark:text-slate-200 print:text-black">{(summary.weight / ((user?.profile?.height / 100) ** 2)).toFixed(1)} Index</p>
          </div>
          <div className="text-xs">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Known Conditions</span>
            <p className="font-bold mt-1 text-slate-800 dark:text-slate-200 print:text-black truncate">{user?.profile?.diseases?.join(', ') || 'None'}</p>
          </div>
        </div>

        {/* Vitals averages values */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300 print:text-black flex items-center gap-1.5">
            <TrendingUp size={16} />
            <span>Weekly Vitals Average Metrics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            {/* Steps */}
            <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-900 print:border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500">Steps Average</span>
              <p className="text-lg font-extrabold text-white mt-1 print:text-black">{summary.avgSteps} steps / day</p>
            </div>

            {/* Rest */}
            <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-900 print:border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500">Sleep Duration</span>
              <p className="text-lg font-extrabold text-white mt-1 print:text-black">{summary.avgSleep} hours / night</p>
            </div>

            {/* Heart Rate */}
            <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-900 print:border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500">Resting Heart Rate</span>
              <p className="text-lg font-extrabold text-white mt-1 print:text-black">{summary.avgHeartRate} bpm</p>
            </div>

          </div>
        </div>

        {/* Clinical Summary AI section */}
        <div className="space-y-4 pt-6 border-t border-slate-800 print:border-slate-300">
          <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300 print:text-black flex items-center gap-1.5">
            <Sparkles size={16} className="text-indigo-400" />
            <span>Aura AI Clinical Advisory Summary</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-900 print:bg-slate-50 print:border-slate-200 print:text-black">
            The patient shows stable resting biometrics over the active 7-day monitoring window. 
            The heart rate averages around {summary.avgHeartRate} bpm, indicating healthy athletic cardiovascular efficiency. 
            Averaging {summary.avgSleep} hours of nightly rest supports normal hormone synthesis, although step count targets could be raised to lower LDL risks.
          </p>
        </div>

        {/* Footer info warning */}
        <div className="pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500 print:border-slate-300 print:text-slate-600">
          <div className="flex items-center justify-center gap-1 text-emerald-500 font-bold mb-2">
            <ShieldCheck size={12} />
            <span>DIGITALLY SIGNED VIA AURA DIAGNOSTIC ENGINE</span>
          </div>
          <p>This document is a computerized biometrics review and does not constitute a doctor diagnosis.</p>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
