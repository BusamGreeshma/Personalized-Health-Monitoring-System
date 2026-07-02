import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Sparkles } from 'lucide-react';
import GlassCard from '../components/Common/GlassCard';

const Register = () => {
  const { register: signup } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await signup(data.username, data.email, data.password);
    setSubmitting(false);

    if (result.success) {
      showToast('Account Created!', 'Welcome to Aura Health system! Let us set up your profile details.', 'success');
      navigate('/profile');
    } else {
      showToast('Registration Error', result.message || 'Check email or name.', 'alert');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden dots-grid">
      {/* Radial glows */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" />

      <GlassCard className="max-w-md w-full p-8 relative z-10" hover={false}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-md mb-3">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Get started with personalized health telemetry.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3 text-slate-500" />
              <input
                type="text"
                placeholder="supermario"
                className="w-full glass-input pl-10 text-sm"
                {...register('username', { 
                  required: 'Username is required', 
                  minLength: { value: 3, message: 'Minimum username is 3 characters' }
                })}
              />
            </div>
            {errors.username && <span className="text-[10px] text-rose-400 font-medium">{errors.username.message}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3 text-slate-500" />
              <input
                type="email"
                placeholder="mario@nintendo.com"
                className="w-full glass-input pl-10 text-sm"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' } 
                })}
              />
            </div>
            {errors.email && <span className="text-[10px] text-rose-400 font-medium">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full glass-input pl-10 text-sm"
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: { value: 6, message: 'Password must have at least 6 characters' } 
                })}
              />
            </div>
            {errors.password && <span className="text-[10px] text-rose-400 font-medium">{errors.password.message}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full glass-btn-primary flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Register;
