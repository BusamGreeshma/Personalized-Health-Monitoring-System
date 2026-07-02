import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { Sparkles, Utensils, Dumbbell, Droplet, Clock, CheckCircle } from 'lucide-react';

const RecommendationEngine = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/recommendations');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to compile AI recommendations.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingSkeleton count={4} height="h-44" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Recommendation Engine</h2>
          <p className="text-xs text-slate-400">Custom meal planning, structured workout regimens, and weekly wellness targets.</p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="glass-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
        >
          <Sparkles size={14} />
          <span>Regenerate Recommendations</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diet Meal Plan (Left Col, span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
              <Utensils className="text-emerald-400" size={18} />
              <h3 className="font-semibold text-base">Personalized Daily Diet Plan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Breakfast */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Breakfast</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">{plans?.mealPlan?.breakfast || 'Oats & berries'}</p>
              </div>

              {/* Lunch */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Lunch</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">{plans?.mealPlan?.lunch || 'Chicken salad'}</p>
              </div>

              {/* Dinner */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Dinner</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">{plans?.mealPlan?.dinner || 'Grilled salmon'}</p>
              </div>

              {/* Snack */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Snack</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">{plans?.mealPlan?.snack || 'Nuts & Greek yogurt'}</p>
              </div>

            </div>
          </GlassCard>

          {/* Fitness Workout Plan */}
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
              <Dumbbell className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-base">Custom Exercise Routine</h3>
            </div>

            <div className="space-y-3">
              {plans?.workoutPlan?.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.exercise}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Intensity: {item.intensity}</p>
                  </div>
                  <span className="badge-success">{item.duration}</span>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Weekly Goals & Metrics Targets (Right Col) */}
        <div className="space-y-8">
          
          {/* Vitals Goals Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard hover={false} className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
                <Droplet size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Water Target</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{plans?.waterTarget || 2800} ml</p>
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/10">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sleep Target</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{plans?.sleepGoal || 8} hrs</p>
              </div>
            </GlassCard>
          </div>

          {/* Weekly Objectives List */}
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
              <CheckCircle className="text-cyan-400" size={18} />
              <h3 className="font-semibold text-base">Weekly Objectives</h3>
            </div>

            <div className="space-y-3.5">
              {plans?.weeklyGoals?.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                  <span className="text-cyan-400 mt-0.5">✔</span>
                  <p className="text-slate-300">{goal}</p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default RecommendationEngine;
