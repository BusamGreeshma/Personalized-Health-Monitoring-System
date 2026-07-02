import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { Apple, Plus, Check, Info, Sparkles } from 'lucide-react';

const NutritionTracker = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, reset } = useForm();

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logs/summary/${todayStr}`);
      if (res.data.success) {
        const loggedMeals = res.data.data.meals || [];
        setMeals(loggedMeals);

        // Sum macros
        let cal = 0, prot = 0, carb = 0, fat = 0;
        loggedMeals.forEach(m => {
          cal += m.calories || 0;
          prot += m.protein || 0;
          carb += m.carbs || 0;
          fat += m.fats || 0;
        });
        setTotals({ calories: cal, protein: prot, carbs: carb, fats: fat });
      }

      // Fetch dynamic diet recommendations from backend AI
      const recsRes = await api.get('/ai/recommendations');
      if (recsRes.data.success) {
        setSuggestions([
          recsRes.data.data.mealPlan?.breakfast,
          recsRes.data.data.mealPlan?.lunch,
          recsRes.data.data.mealPlan?.dinner,
          recsRes.data.data.mealPlan?.snack
        ].filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        date: todayStr,
        mealType: data.mealType,
        foodName: data.foodName,
        calories: parseInt(data.calories),
        protein: parseInt(data.protein || 0),
        carbs: parseInt(data.carbs || 0),
        fats: parseInt(data.fats || 0)
      };

      const res = await api.post('/logs/nutrition', payload);
      if (res.data.success) {
        showToast('Meal Logged', `${data.foodName} has been saved in nutrition diary.`, 'success');
        reset();
        fetchNutritionData(); // Refresh totals & list
      }
    } catch (err) {
      showToast('Error', 'Failed to log nutrition details.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const macroTargets = { calories: 2000, protein: 120, carbs: 230, fats: 65 };

  const getPercent = (curr, target) => Math.min(Math.round((curr / target) * 100), 100);

  if (loading) {
    return <LoadingSkeleton count={3} height="h-44" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nutrition Tracker</h2>
        <p className="text-xs text-slate-400">Log meals and balance macronutrient calories to maintain fitness standards.</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <GlassCard hover={false} className="p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Calories</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{totals.calories}</span>
            <span className="text-xs text-slate-500 ml-1">/ {macroTargets.calories} kcal</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${getPercent(totals.calories, macroTargets.calories)}%` }} />
          </div>
        </GlassCard>

        {/* Protein Card */}
        <GlassCard hover={false} className="p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-rose-400">Protein</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{totals.protein}g</span>
            <span className="text-xs text-slate-500 ml-1">/ {macroTargets.protein}g</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${getPercent(totals.protein, macroTargets.protein)}%` }} />
          </div>
        </GlassCard>

        {/* Carbs Card */}
        <GlassCard hover={false} className="p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-cyan-400">Carbohydrates</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{totals.carbs}g</span>
            <span className="text-xs text-slate-500 ml-1">/ {macroTargets.carbs}g</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${getPercent(totals.carbs, macroTargets.carbs)}%` }} />
          </div>
        </GlassCard>

        {/* Fats Card */}
        <GlassCard hover={false} className="p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-amber-400">Fats</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{totals.fats}g</span>
            <span className="text-xs text-slate-500 ml-1">/ {macroTargets.fats}g</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${getPercent(totals.fats, macroTargets.fats)}%` }} />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Log Forms */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Apple className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-sm">Add New Meal Entry</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Meal Type</label>
                <select className="glass-input text-sm bg-slate-900" {...register('mealType')}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Food / Drink Name</label>
                <input type="text" placeholder="e.g. Avocado Toast with Egg" className="glass-input text-sm" {...register('foodName', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Calories (kcal)</label>
                <input type="number" placeholder="280" className="glass-input text-sm" {...register('calories', { required: true })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Protein (g)</label>
                  <input type="number" placeholder="12" className="glass-input text-xs" {...register('protein')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Carbs (g)</label>
                  <input type="number" placeholder="30" className="glass-input text-xs" {...register('carbs')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Fats (g)</label>
                  <input type="number" placeholder="8" className="glass-input text-xs" {...register('fats')} />
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end pt-3">
                <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-1.5">
                  <Plus size={14} />
                  <span>Log Meal Entry</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Log History */}
          <GlassCard hover={false} className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Today's Meal Diary</span>
            {meals.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-6 text-center">No meals logged today.</p>
            ) : (
              <div className="divide-y divide-slate-900">
                {meals.map(m => (
                  <div key={m._id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{m.foodName}</h4>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">{m.mealType} • P: {m.protein}g, C: {m.carbs}g, F: {m.fats}g</p>
                    </div>
                    <span className="font-semibold text-slate-300">{m.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: AI Recipes recommendations */}
        <div className="space-y-6">
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Sparkles className="text-indigo-400 animate-pulse" size={16} />
              <h3 className="font-semibold text-sm">AI Food Suggestions</h3>
            </div>
            
            <div className="p-3 rounded-xl bg-indigo-950/10 border border-indigo-500/10 text-[11px] text-indigo-400 leading-relaxed flex gap-2">
              <Info size={16} className="flex-shrink-0" />
              <span>Recommendations are tailored from your allergy logs (penicillin, peanuts, etc.) and pre-existing diagnoses.</span>
            </div>

            <div className="space-y-3.5 pt-2">
              {suggestions.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/30 border border-slate-900 flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="text-indigo-400 mt-0.5">✦</span>
                  <p>{s}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default NutritionTracker;
