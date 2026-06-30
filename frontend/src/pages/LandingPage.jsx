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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-extrabold text-sm tracking-tighter">A</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AURA</span>
          <span className="text-xs font-semibold text-cyan-400 ml-1">HEALTH</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="glass-btn-secondary py-1.5 px-4 text-xs">
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="glass-btn-primary py-1.5 px-4 text-xs">
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 flex flex-col justify-center items-center text-center z-10 py-12 md:py-24">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6"
        >
          <Sparkles size={12} className="animate-spin" />
          <span>Next-Generation AI Vitals Telemetry</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl"
        >
          Your Personal <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">AI Vitals Analyst</span> & Clinical Companion.
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-lg max-w-2xl mt-6 leading-relaxed"
        >
          Monitor biometric telemetry, calculate dynamic health scores, analyze complex blood reports with vision OCR, and get personalized RAG-driven advice—all in one place.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <button
            onClick={() => navigate('/register')}
            className="glass-btn-primary px-8 py-3.5 flex items-center gap-2 group text-sm"
          >
            <span>Start Monitoring Free</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="glass-btn-secondary px-8 py-3.5 text-sm"
          >
            Explore Dashboard Demo
          </button>
        </motion.div>

        {/* Value Prop Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-24"
        >
          <div className="glass-panel p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/10">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold text-sm">Dynamic AI Health Score</h3>
            <p className="text-xs text-slate-400 mt-2 text-center">Continuous diagnostic telemetry compiled from step logs, rest parameters, and vitals.</p>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/10">
              <Sparkles size={20} />
            </div>
            <h3 className="font-semibold text-sm">Vision Report OCR</h3>
            <p className="text-xs text-slate-400 mt-2 text-center">Upload blood panel images/PDFs and get extracted parameters with abnormal values highlights.</p>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/10">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-sm">Predictive Risk Modeling</h3>
            <p className="text-xs text-slate-400 mt-2 text-center">Analyze markers to estimate percentages and safety trends for Diabetes or Heart Disease.</p>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-500/10">
              <Heart size={20} />
            </div>
            <h3 className="font-semibold text-sm">Gamified Badges & Streaks</h3>
            <p className="text-xs text-slate-400 mt-2 text-center">Stay motivated by tracking consecutive logs and unlocking fitness streaks and awards.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-800/40 flex items-center justify-center text-xs text-slate-500 z-10 bg-slate-950/80">
        <span>© 2026 Aura Health Technologies. All rights reserved. Created for Project Expo.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
