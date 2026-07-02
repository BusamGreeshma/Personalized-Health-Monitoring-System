import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useForm, useFieldArray } from 'react-hook-form';
import GlassCard from '../components/Common/GlassCard';
import { User, Activity, AlertTriangle, ShieldCheck, Plus, Trash2, Award } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();
  const [updating, setUpdating] = useState(false);
  const [newDisease, setNewDisease] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      age: user?.profile?.age || 30,
      gender: user?.profile?.gender || 'Male',
      height: user?.profile?.height || 170,
      weight: user?.profile?.weight || 70,
      activityLevel: user?.profile?.activityLevel || 'Moderately Active',
      diseases: user?.profile?.diseases || [],
      allergies: user?.profile?.allergies || [],
      emergencyContacts: user?.profile?.emergencyContacts || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts"
  });

  const diseases = watch('diseases') || [];
  const allergies = watch('allergies') || [];

  const handleAddDisease = () => {
    if (newDisease.trim() && !diseases.includes(newDisease.trim())) {
      setValue('diseases', [...diseases, newDisease.trim()]);
      setNewDisease('');
    }
  };

  const handleRemoveDisease = (idx) => {
    setValue('diseases', diseases.filter((_, i) => i !== idx));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setValue('allergies', [...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (idx) => {
    setValue('allergies', allergies.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    setUpdating(true);
    const result = await updateProfile(data);
    setUpdating(false);

    if (result && result.success) {
      showToast('Profile Updated', 'Your health metrics and settings have been saved.', 'success');
    } else {
      showToast('Profile Error', result?.message || 'Error occurred while saving profile.', 'alert');
    }
  };

  const activityOptions = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <GlassCard className="relative overflow-hidden p-8 border-indigo-500/25 bg-gradient-to-r from-indigo-950/20 to-cyan-950/10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">{user?.username}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.email} • Account type: <span className="capitalize text-indigo-400 font-semibold">{user?.role}</span></p>
            <div className="flex gap-4 mt-3 justify-center sm:justify-start">
              <span className="badge-success">🔥 {user?.streak || 0} Day Active Streak</span>
              {user?.badges?.length > 0 && <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">🏆 {user.badges.length} Badges Earned</span>}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Fields */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Demographics Card */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <User className="text-indigo-400" size={18} />
                <h3 className="font-semibold text-base">Physical Demographics</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Age</label>
                  <input
                    type="number"
                    className="glass-input text-sm"
                    {...register('age', { required: 'Age is required', min: 1 })}
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gender</label>
                  <select className="glass-input text-sm bg-slate-900" {...register('gender')}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Height */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Height (cm)</label>
                  <input
                    type="number"
                    className="glass-input text-sm"
                    {...register('height', { required: 'Height is required', min: 20 })}
                  />
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weight (kg)</label>
                  <input
                    type="number"
                    className="glass-input text-sm"
                    {...register('weight', { required: 'Weight is required', min: 5 })}
                  />
                </div>

                {/* Activity Level */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Activity Level</label>
                  <select className="glass-input text-sm bg-slate-900" {...register('activityLevel')}>
                    {activityOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </GlassCard>

            {/* Medical Context Card */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <AlertTriangle className="text-amber-400" size={18} />
                <h3 className="font-semibold text-base">Health History & Allergies</h3>
              </div>

              {/* Diseases */}
              <div className="space-y-3">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pre-existing Diseases / Diagnoses</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Diabetes, Hypertension"
                    className="flex-1 glass-input text-sm"
                    value={newDisease}
                    onChange={(e) => setNewDisease(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDisease())}
                  />
                  <button
                    type="button"
                    onClick={handleAddDisease}
                    className="glass-btn-secondary px-3 py-2 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {diseases.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No pre-existing conditions declared</span>
                  ) : (
                    diseases.map((d, idx) => (
                      <span key={idx} className="bg-slate-800 border border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        {d}
                        <button type="button" onClick={() => handleRemoveDisease(idx)} className="text-slate-500 hover:text-rose-400 font-semibold cursor-pointer">✕</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-3">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Allergies</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts, Pollen"
                    className="flex-1 glass-input text-sm"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="glass-btn-secondary px-3 py-2 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergies.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No allergies declared</span>
                  ) : (
                    allergies.map((a, idx) => (
                      <span key={idx} className="bg-slate-800 border border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        {a}
                        <button type="button" onClick={() => handleRemoveAllergy(idx)} className="text-slate-500 hover:text-rose-400 font-semibold cursor-pointer">✕</button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Emergency Contacts Card */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Activity className="text-rose-400" size={18} />
                  <h3 className="font-semibold text-base">Emergency Contacts</h3>
                </div>
                <button
                  type="button"
                  onClick={() => append({ name: '', relation: '', phone: '' })}
                  className="glass-btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add Contact</span>
                </button>
              </div>

              {fields.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No contacts declared. An emergency SOS profile is incomplete without one.</p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-900 relative">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Name</label>
                        <input
                          type="text"
                          className="glass-input text-xs"
                          placeholder="Contact name"
                          {...register(`emergencyContacts.${idx}.name`, { required: true })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Relationship</label>
                        <input
                          type="text"
                          className="glass-input text-xs"
                          placeholder="e.g. Spouse, Father"
                          {...register(`emergencyContacts.${idx}.relation`, { required: true })}
                        />
                      </div>
                      <div className="flex flex-col gap-1 relative pr-8">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className="glass-input text-xs"
                          placeholder="+1234567890"
                          {...register(`emergencyContacts.${idx}.phone`, { required: true })}
                        />
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="absolute right-0 bottom-2.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Save Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={updating}
                className="glass-btn-primary px-8 flex items-center gap-2"
              >
                {updating ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Save Profile Configuration</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Achievements */}
        <div className="space-y-6">
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
              <Award className="text-yellow-400" size={18} />
              <h3 className="font-semibold text-base">Earned Badges</h3>
            </div>
            {user?.badges?.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">Commit to daily logs to unlock achievements and reward badges!</p>
            ) : (
              <div className="space-y-3">
                {user?.badges?.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 flex items-start gap-3">
                    <div className="text-xl">🏆</div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
              <ShieldCheck className="text-indigo-400" size={18} />
              <h3 className="font-semibold text-base">System Access Vitals</h3>
            </div>
            <div className="text-xs space-y-2 text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-medium">Fully Authorized</span>
              </div>
              <div className="flex justify-between">
                <span>Security Engine:</span>
                <span className="text-slate-600 dark:text-slate-300">JWT Token Enabled</span>
              </div>
              <div className="flex justify-between">
                <span>Database Sync:</span>
                <span className="text-slate-600 dark:text-slate-300">MongoDB Atlas Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Vitals Stream:</span>
                <span className="text-slate-600 dark:text-slate-300">Local Telemetry Sim active</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
