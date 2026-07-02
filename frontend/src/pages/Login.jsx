import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { Sparkles, Mail, Lock } from 'lucide-react';
import GlassCard from '../components/Common/GlassCard';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);

    if (result.success) {
      showToast('Welcome back!', 'Successfully signed into Aura Health dashboard.', 'success');
      navigate('/');
    } else {
      showToast('Authentication Error', result.message || 'Check credentials.', 'alert');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden dots-grid">
      {/* Background radial glows */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" />

      <GlassCard className="max-w-md w-full p-8 relative z-10" hover={false}>
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-md mb-3">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Sign in to Aura</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3 text-slate-500" />
              <input
                type="email"
                placeholder="doctor@aura.com"
                className="w-full glass-input pl-10 text-sm"
                {...register('email', { 
                  required: 'Email address is required', 
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email structure' } 
                })}
              />
            </div>
            {errors.email && <span className="text-[10px] text-rose-400 font-medium">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/register" className="text-[10px] text-indigo-400 hover:text-indigo-300">Forgot Password?</Link>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full glass-input pl-10 text-sm"
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: { value: 6, message: 'Minimum password length is 6 characters' } 
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
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create free account
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
