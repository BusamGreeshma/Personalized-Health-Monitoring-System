import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import GlassCard from '../components/Common/GlassCard';
import { useForm } from 'react-hook-form';
import { Plus, Droplet, Heart, Apple, Activity, Moon, Smile, Check } from 'lucide-react';

const DailyLogs = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('vitals');
  const [saving, setSaving] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Forms
  const { register: vitalsReg, handleSubmit: vitalsSubmit, reset: vitalsReset } = useForm();
  const { register: mealReg, handleSubmit: mealSubmit, reset: mealReset } = useForm();
  const { register: exerciseReg, handleSubmit: exerciseSubmit, reset: exerciseReset } = useForm();
  const { register: sleepReg, handleSubmit: sleepSubmit, reset: sleepReset } = useForm();
  const { register: moodReg, handleSubmit: moodSubmit, reset: moodReset } = useForm();

  const onLogVitals = async (data) => {
    setSaving(true);
    try {
      const payload = {
        date: todayStr,
        heartRate: parseInt(data.heartRate),
        bloodPressure: {
          systolic: parseInt(data.systolic),
          diastolic: parseInt(data.diastolic)
        },
        bloodSugar: parseInt(data.bloodSugar),
        oxygenLevel: parseInt(data.oxygenLevel),
        weight: parseFloat(data.weight)
      };

      const res = await api.post('/logs/health', payload);
      if (res.data.success) {
        showToast('Vitals Logged', 'Vitals telemetry updated successfully.', 'success');
        vitalsReset();
      }
    } catch (err) {
      showToast('Log Error', 'Failed to update vitals.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const onLogMeal = async (data) => {
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
        showToast('Meal Logged', `${data.foodName} has been logged in nutrition tracker.`, 'success');
        mealReset();
      }
    } catch (err) {
      showToast('Log Error', 'Failed to log nutrition details.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const onLogExercise = async (data) => {
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
        showToast('Workout Logged', 'Fitness telemetry updated and calories burned synced.', 'success');
        exerciseReset();
      }
    } catch (err) {
      showToast('Log Error', 'Failed to record exercise session.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const onLogSleep = async (data) => {
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
        sleepReset();
      }
    } catch (err) {
      showToast('Log Error', 'Failed to record sleep details.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const onLogMood = async (data) => {
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
        showToast('Mood Logged', 'Mental wellness suggestions compiled successfully.', 'success');
        moodReset();
      }
    } catch (err) {
      showToast('Log Error', 'Failed to save mood parameters.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'vitals', label: 'Vitals & BP', icon: Heart },
    { id: 'meal', label: 'Nutrition', icon: Apple },
    { id: 'exercise', label: 'Fitness', icon: Activity },
    { id: 'sleep', label: 'Sleep Rest', icon: Moon },
    { id: 'mood', label: 'Mood Wellness', icon: Smile }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Health Logger</h2>
        <p className="text-xs text-slate-400">Record daily health logs and telemetry to train Aura recommendations engine.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-2 pb-px overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Log Form Area */}
      <GlassCard hover={false} className="p-8">
        
        {/* VITALS FORM */}
        {activeTab === 'vitals' && (
          <form onSubmit={vitalsSubmit(onLogVitals)} className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 pb-3 border-b border-slate-800/80">Log Vitals & Demographics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Heart Rate (bpm)</label>
                <input type="number" placeholder="72" className="glass-input text-sm" {...vitalsReg('heartRate', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Systolic BP</label>
                  <input type="number" placeholder="120" className="glass-input text-sm" {...vitalsReg('systolic', { required: true })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Diastolic BP</label>
                  <input type="number" placeholder="80" className="glass-input text-sm" {...vitalsReg('diastolic', { required: true })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Blood Sugar (mg/dL)</label>
                <input type="number" placeholder="95" className="glass-input text-sm" {...vitalsReg('bloodSugar', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Oxygen Level (% SpO2)</label>
                <input type="number" placeholder="98" className="glass-input text-sm" {...vitalsReg('oxygenLevel', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-slate-400">Current Weight (kg)</label>
                <input type="number" step="0.1" placeholder="70.5" className="glass-input text-sm" {...vitalsReg('weight', { required: true })} />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2">
                <Check size={14} />
                <span>{saving ? 'Saving...' : 'Save Vitals'}</span>
              </button>
            </div>
          </form>
        )}

        {/* MEAL NUTRITION FORM */}
        {activeTab === 'meal' && (
          <form onSubmit={mealSubmit(onLogMeal)} className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 pb-3 border-b border-slate-800/80">Log Nutrition Intake</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Meal Type</label>
                <select className="glass-input text-sm bg-slate-900" {...mealReg('mealType')}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Food Name</label>
                <input type="text" placeholder="e.g. Scrambled eggs & Sourdough" className="glass-input text-sm" {...mealReg('foodName', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Calories (kcal)</label>
                <input type="number" placeholder="350" className="glass-input text-sm" {...mealReg('calories', { required: true })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Protein (g)</label>
                  <input type="number" placeholder="15" className="glass-input text-sm" {...mealReg('protein')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Carbs (g)</label>
                  <input type="number" placeholder="25" className="glass-input text-sm" {...mealReg('carbs')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Fats (g)</label>
                  <input type="number" placeholder="10" className="glass-input text-sm" {...mealReg('fats')} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2">
                <Check size={14} />
                <span>{saving ? 'Saving...' : 'Log Nutrition'}</span>
              </button>
            </div>
          </form>
        )}

        {/* FITNESS WORKOUT FORM */}
        {activeTab === 'exercise' && (
          <form onSubmit={exerciseSubmit(onLogExercise)} className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 pb-3 border-b border-slate-800/80">Log Exercise Session</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Activity Type</label>
                <select className="glass-input text-sm bg-slate-900" {...exerciseReg('activityType')}>
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="gym">Gym Workout</option>
                  <option value="other">Other Exercise</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Duration (Minutes)</label>
                <input type="number" placeholder="30" className="glass-input text-sm" {...exerciseReg('duration', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Distance (km) (Optional)</label>
                <input type="number" step="0.01" placeholder="2.5" className="glass-input text-sm" {...exerciseReg('distance')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Calories Burned (kcal)</label>
                <input type="number" placeholder="200" className="glass-input text-sm" {...exerciseReg('caloriesBurned', { required: true })} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2">
                <Check size={14} />
                <span>{saving ? 'Saving...' : 'Log Workout'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SLEEP REST FORM */}
        {activeTab === 'sleep' && (
          <form onSubmit={sleepSubmit(onLogSleep)} className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 pb-3 border-b border-slate-800/80">Log Sleep Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Sleep Duration (Hours)</label>
                <input type="number" step="0.1" placeholder="7.5" className="glass-input text-sm" {...sleepReg('duration', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Sleep Quality (1-5)</label>
                <select className="glass-input text-sm bg-slate-900" {...sleepReg('quality')}>
                  <option value="5">5 - Excellent Rest</option>
                  <option value="4">4 - Good Sleep</option>
                  <option value="3">3 - Light Restless</option>
                  <option value="2">2 - Poor Sleep</option>
                  <option value="1">1 - Extremely Restless</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Bedtime (HH:MM)</label>
                <input type="time" placeholder="22:30" className="glass-input text-sm" {...sleepReg('bedtime', { required: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Wake-up Time (HH:MM)</label>
                <input type="time" placeholder="06:30" className="glass-input text-sm" {...sleepReg('wakeupTime', { required: true })} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2">
                <Check size={14} />
                <span>{saving ? 'Saving...' : 'Log Sleep'}</span>
              </button>
            </div>
          </form>
        )}

        {/* MOOD WELLNESS FORM */}
        {activeTab === 'mood' && (
          <form onSubmit={moodSubmit(onLogMood)} className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 pb-3 border-b border-slate-800/80">Log Mood & Stress Levels</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Mood State</label>
                <select className="glass-input text-sm bg-slate-900" {...moodReg('mood')}>
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
                  <input type="number" min="1" max="10" placeholder="2" className="glass-input text-sm" {...moodReg('stressLevel', { required: true })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Anxiety (1-10)</label>
                  <input type="number" min="1" max="10" placeholder="2" className="glass-input text-sm" {...moodReg('anxietyLevel', { required: true })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-slate-400">Mood Journal Notes (Optional)</label>
                <textarea rows="3" placeholder="Write any details about today's stressors or mindfulness..." className="glass-input text-sm resize-none" {...moodReg('notes')} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2">
                <Check size={14} />
                <span>{saving ? 'Saving...' : 'Log Mood'}</span>
              </button>
            </div>
          </form>
        )}

      </GlassCard>
    </div>
  );
};

export default DailyLogs;
