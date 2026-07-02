import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { Calendar, Plus, Check, Clock, ShieldCheck, X } from 'lucide-react';

const AppointmentModule = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve appointments list.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        doctorName: data.doctorName,
        specialty: data.specialty,
        dateTime: new Date(data.dateTime),
        notes: data.notes,
        reminderMinutesBefore: parseInt(data.reminderMinutesBefore || 30)
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        showToast('Appointment Scheduled', `Booked consultation with Dr. ${data.doctorName}.`, 'success');
        reset();
        fetchAppointments();
      }
    } catch (err) {
      showToast('Error', 'Failed to schedule doctor consultation.', 'alert');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/appointments/${id}`, { status });
      if (res.data.success) {
        showToast('Status Updated', `Appointment marked as ${status}.`, 'success');
        fetchAppointments();
      }
    } catch (error) {
      showToast('Error', 'Failed to update consultation status.', 'alert');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Doctor Appointments</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Schedule visits, log consultation summaries, and configure reminder alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: scheduler Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Calendar className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-sm">Schedule Consultation</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Doctor Name</label>
                <input type="text" placeholder="e.g. John Watson" className="glass-input text-xs" {...register('doctorName', { required: true })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Specialty</label>
                <input type="text" placeholder="e.g. Cardiologist" className="glass-input text-xs" {...register('specialty', { required: true })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Date & Time</label>
                <input type="datetime-local" className="glass-input text-xs" {...register('dateTime', { required: true })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Alert Lead Time (Minutes)</label>
                <input type="number" placeholder="30" className="glass-input text-xs" {...register('reminderMinutesBefore')} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">Consultation Notes (Optional)</label>
                <textarea rows="3" placeholder="Symptom details or reports..." className="glass-input text-xs resize-none" {...register('notes')} />
              </div>

              <button type="submit" disabled={saving} className="w-full glass-btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5 mt-2">
                <Plus size={12} />
                <span>{saving ? 'Booking...' : 'Book Appointment'}</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Col: Consultation logs lists */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false} className="space-y-6 border-slate-800/80">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Clock className="text-cyan-400" size={18} />
              <h3 className="font-semibold text-sm">Consultation Schedules</h3>
            </div>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center py-8">No scheduled consultation logs found.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map(appt => (
                  <div key={appt._id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex justify-between items-start gap-4">
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Dr. {appt.doctorName}</h4>
                        <span className="badge-success text-[10px] py-px px-2">{appt.specialty}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1.5">
                        Date: {new Date(appt.dateTime).toLocaleString()}
                      </p>
                      {appt.notes && <p className="text-slate-500 mt-1 italic font-medium">Notes: {appt.notes}</p>}
                      
                      {/* Control buttons */}
                      <div className="flex gap-2.5 mt-3">
                        {appt.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'completed')}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                              className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appt.status === 'completed' && (
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck size={11} /> Completed
                          </span>
                        )}
                        {appt.status === 'cancelled' && (
                          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <X size={11} /> Cancelled
                          </span>
                        )}
                      </div>
                    </div>
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

export default AppointmentModule;
