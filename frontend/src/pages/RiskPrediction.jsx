import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { ShieldAlert, Heart, Activity, HelpCircle } from 'lucide-react';

const RiskPrediction = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState([]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/predict-risk');
      if (res.data.success) {
        setRisks(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve AI health risk predictions.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  if (loading) {
    return <LoadingSkeleton count={3} height="h-64" className="mt-8" />;
  }

  const getRiskBadge = (level) => {
    if (level === 'High') return 'badge-danger';
    if (level === 'Moderate') return 'badge-warning';
    return 'badge-success';
  };

  const getProgressColor = (level) => {
    if (level === 'High') return 'bg-rose-500';
    if (level === 'Moderate') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Health Risk Predictions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Explainable AI (XAI) engine mapping physical vitals telemetry against risk categories.</p>
        </div>
        <button
          onClick={fetchRisks}
          className="glass-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
        >
          <ShieldAlert size={14} />
          <span>Run Diagnosis Assessment</span>
        </button>
      </div>

      {/* Warning Alert */}
      <div className="p-3.5 rounded-xl bg-indigo-950/15 border border-indigo-500/25 text-indigo-400 text-xs flex items-center gap-2">
        <HelpCircle size={16} className="text-indigo-400" />
        <span>How it works: Aura parses your logged blood sugar, resting heart rate, height-to-weight BMI ratio, and clinical reports to compute conditional risk vectors.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {risks.map((item, idx) => (
          <GlassCard key={idx} hover={false} className="space-y-5 border-slate-800/80">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">{item.condition}</h3>
                <span className={`inline-block mt-1 ${getRiskBadge(item.riskLevel)}`}>
                  {item.riskLevel} Risk
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">{item.riskPercentage}%</span>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Risk Factor</p>
              </div>
            </div>

            {/* Risk Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(item.riskLevel)}`}
                style={{ width: `${item.riskPercentage}%` }}
              />
            </div>

            {/* Explanations (XAI) */}
            <div className="space-y-3 pt-3 border-t border-slate-900">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Primary Risk Indicators</span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-1.5 list-disc list-inside">
                  {item.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Preventive Guidelines</span>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-1.5 list-disc list-inside">
                  {item.preventiveMeasures.map((pm, i) => (
                    <li key={i}>{pm}</li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default RiskPrediction;
