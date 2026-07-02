import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, ShieldCheck, Zap, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden dots-grid">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Header */}
      <header className="h-20 max-w-7xl w-full mx-auto px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-slate-200">AURA</span>
            <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase -mt-0.5">Health suite</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="glass-btn-secondary py-1.5 px-4 text-xs">
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="glass-btn-primary py-1.5 px-4 text-xs">
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 flex flex-col justify-center items-center text-center z-10 py-12 md:py-24">
        {/* Modern Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-medium mb-6"
        >
          <Sparkles size={11} className="text-indigo-400" />
          <span>Clinical Intelligence Platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.15]"
        >
          Smarter biometrics tracking. <br />
          <span className="text-indigo-400">In one unified platform.</span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base max-w-xl mt-6 leading-relaxed"
        >
          Monitor your vitals, analyze clinical reports, calculate wellness scores, and receive personalized advice. Aura integrates all your daily metrics into a clean, secure dashboard.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <button
            onClick={() => navigate('/register')}
            className="glass-btn-primary px-6 py-2.5 flex items-center gap-2 text-xs"
          >
            <span>Start Tracking Free</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="glass-btn-secondary px-6 py-2.5 text-xs"
          >
            Explore Dashboard Demo
          </button>
        </motion.div>

        {/* Value Prop Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full mt-20"
        >
          <div className="glass-panel glass-panel-hover p-6 flex flex-col items-start text-left">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <Zap size={16} />
            </div>
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">Health Index</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Dynamic scores calculated from daily vitals, sleep parameters, and physical activities.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 flex flex-col items-start text-left">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <Sparkles size={16} />
            </div>
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">Report Analyzer</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Extract and cross-reference biometric indicators directly from uploaded lab panels.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 flex flex-col items-start text-left">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <ShieldCheck size={16} />
            </div>
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">Risk Assessments</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Early warning indicators and preventative modeling for heart and diabetic conditions.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 flex flex-col items-start text-left">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
              <Heart size={16} />
            </div>
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">Streak & Habits</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Stay consistent with habit tracking, streak milestones, and positive reinforcement guides.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-900 flex items-center justify-center text-[10px] text-slate-500 z-10 bg-slate-950/80">
        <span>© 2026 Aura Health Technologies. All rights reserved. Created for Project Expo.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
