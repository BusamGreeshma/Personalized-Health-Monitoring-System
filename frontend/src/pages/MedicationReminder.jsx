import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { Pill, Plus, Check, Trash2, Calendar, AlertCircle } from 'lucide-react';

const MedicationReminder = () => {
  const { showToast, fetchMedicationList, medications } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, reset } = useForm();

  const fetchMedications = async () => {
    try {
      setLoading(true);
      await fetchMedicationList();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve medication schedule.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Split comma separated times e.g. "08:00, 20:00"
      const timesArray = data.times.split(',').map(t => t.trim());
      
      const payload = {
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        times: timesArray,
        startDate: new Date(),
        remindersEnabled: true
      };

      const res = await api.post('/medications', payload);
      if (res.data.success) {
        showToast('Medication Scheduled', `${data.name} dosage scheduled successfully.`, 'success');
        reset();
        fetchMedications();
      }
    } catch (err) {
      showToast('Error', 'Failed to schedule medication.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const handleLogStatus = async (id, time, status) => {
    try {
      const res = await api.post(`/medications/${id}/log`, {
        date: todayStr,
        time,
        status
      });

      if (res.data.success) {
        showToast('Status Updated', `Dose logged as ${status}.`, 'success');
        fetchMedications();
      }
    } catch (error) {
      showToast('Error', 'Failed to log dose status.', 'alert');
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      const res = await api.delete(`/medications/${id}`);
      if (res.data.success) {
        showToast('Medication Deleted', 'Prescription schedule removed.', 'success');
        fetchMedications();
      }
    } catch (error) {
      showToast('Error', 'Failed to delete schedule.', 'alert');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medication Reminders</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage prescriptions, set times, and track daily dose adherence.</p>
        </div>
        <button
          onClick={() => showToast('Reminder Chime Test', 'This is how your medication alert sounds.', 'medication')}
          className="glass-btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5"
        >
          <Pill size={12} />
          <span>Test Reminder Sound</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: forms */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Pill className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-sm">Schedule Medication</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Medicine Name</label>
                <input type="text" placeholder="e.g. Vitamin D3" className="glass-input text-xs" {...register('name', { required: true })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Dosage Amount</label>
                <input type="text" placeholder="e.g. 1 tablet, 5ml" className="glass-input text-xs" {...register('dosage', { required: true })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Frequency</label>
                <select className="glass-input text-xs bg-slate-100 dark:bg-slate-900" {...register('frequency')}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Twice a day">Twice a day</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Alert Times (Comma separated HH:MM)</label>
                <input type="text" placeholder="e.g. 08:00, 20:00" className="glass-input text-xs" {...register('times', { required: true })} />
              </div>

              <button type="submit" disabled={saving} className="w-full glass-btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5 mt-2">
                <Plus size={12} />
                <span>{saving ? 'Scheduling...' : 'Schedule Medication'}</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Active Meds & Today's Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false} className="space-y-6 border-slate-800/80">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Calendar className="text-cyan-400" size={18} />
              <h3 className="font-semibold text-sm">Today's Dosage Checklist</h3>
            </div>

            {medications.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs italic">
                <AlertCircle size={20} className="mb-1" />
                <span>No medications scheduled. Add one to see reminders.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map(med => (
                  <div key={med._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{med.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dosage: {med.dosage} • Frequency: {med.frequency}</p>
                      
                      {/* Scheduled times checkboxes */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {med.times.map((time, idx) => {
                          const log = med.logs.find(l => l.date === todayStr && l.time === time);
                          const isTaken = log?.status === 'taken';
                          const isMissed = log?.status === 'missed';

                          return (
                            <div key={idx} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg text-[10px]">
                              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1.5">{time}</span>
                              <button
                                onClick={() => handleLogStatus(med._id, time, 'taken')}
                                className={`px-2 py-0.5 rounded cursor-pointer ${isTaken ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:text-slate-200'}`}
                              >
                                Taken
                              </button>
                              <button
                                onClick={() => handleLogStatus(med._id, time, 'missed')}
                                className={`px-2 py-0.5 rounded cursor-pointer ${isMissed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:text-slate-200'}`}
                              >
                                Missed
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMedication(med._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Schedule"
                    >
                      <Trash2 size={15} />
                    </button>
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

export default MedicationReminder;
