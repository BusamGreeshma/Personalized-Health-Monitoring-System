import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/Common/GlassCard';
import { AlertCircle, Phone, ShieldAlert, Activity, Heart } from 'lucide-react';

const PublicEmergencyProfile = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine API base URL dynamically
  const API_URL = import.meta.env.VITE_API_URL || 'https://aura-health-api-gamma.vercel.app/api';

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/public-profile/${userId}`);
        if (res.data.success) {
          setProfileUser(res.data.data);
        } else {
          setError('Profile not found.');
        }
      } catch (err) {
        console.error("Failed to load public profile:", err);
        setError(err.response?.data?.message || 'Failed to fetch emergency profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicProfile();
    }
  }, [userId, API_URL]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest">Retrieving Emergency File...</span>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 p-6">
        <GlassCard className="max-w-md w-full p-8 text-center border-red-500/25 bg-red-950/10">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-100">Access Denied / Not Found</h2>
          <p className="text-sm text-slate-400 mt-2">{error || 'This clinical emergency profile does not exist or has been disabled.'}</p>
        </GlassCard>
      </div>
    );
  }

  const profile = profileUser.profile || {};

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center items-center font-sans">
      
      {/* Dynamic CSS Overrides for PDF printout generation */}
      <style>{`
        @media print {
          body, .min-h-screen {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .glass-card-print {
            border: 2px solid #cbd5e1 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            padding: 2rem !important;
            border-radius: 1rem !important;
            width: 100% !important;
          }
          h2, h3, h4, span, p, div {
            color: #0f172a !important;
          }
          .bg-slate-950\\/50, .bg-slate-950\\/40, .bg-slate-900\\/60, .bg-red-500\\/10, .bg-amber-500\\/10 {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
          }
          .border-slate-800, .border-slate-800\\/80, .border-slate-800\\/40 {
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>

      <div className="max-w-2xl w-full space-y-6">
        
        {/* Print / Save Trigger (Hidden on PDF) */}
        <div className="flex justify-between items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 no-print">
          <span className="text-xs text-slate-400 font-medium">Need a physical copy?</span>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            Save as PDF / Print
          </button>
        </div>

        {/* Banner Alert (Hidden on PDF) */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/35 text-red-400 no-print">
          <ShieldAlert size={24} className="animate-pulse flex-shrink-0" />
          <div>
            <h3 className="font-bold text-sm">EMERGENCY MEDICAL CARD</h3>
            <p className="text-xs text-red-400/80">Authorized for clinical and first-responder personnel only.</p>
          </div>
        </div>

        {/* Primary Health Profile */}
        <GlassCard className="p-8 space-y-6 border-slate-800/80 bg-slate-900/60 backdrop-blur-lg glass-card-print">
          
          {/* Header Details */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 text-2xl font-bold shadow-inner">
              {profileUser.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight">{profileUser.username}</h2>
              <span className="inline-block mt-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                Patient Profile Verified
              </span>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Age</span>
              <p className="text-xl font-bold mt-1 text-slate-200">{profile.age || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gender</span>
              <p className="text-xl font-bold mt-1 text-slate-200">{profile.gender || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Height</span>
              <p className="text-xl font-bold mt-1 text-slate-200">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Weight</span>
              <p className="text-xl font-bold mt-1 text-slate-200">{profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
              <Activity size={16} className="text-red-400" />
              <span>Chronic Medical Conditions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.diseases && profile.diseases.length > 0 ? (
                profile.diseases.map((d, i) => (
                  <span key={i} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium">
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No chronic medical conditions declared.</span>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
              <AlertCircle size={16} className="text-amber-500" />
              <span>Active Drug/Food Allergies</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.allergies && profile.allergies.length > 0 ? (
                profile.allergies.map((a, i) => (
                  <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-medium">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No active allergies declared.</span>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
              <Phone size={16} className="text-indigo-400" />
              <span>Primary Emergency Contacts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.emergencyContacts && profile.emergencyContacts.length > 0 ? (
                profile.emergencyContacts.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium capitalize">{c.relation}</p>
                      <h4 className="text-sm font-bold text-slate-200 mt-0.5">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{c.phone}</p>
                    </div>
                    <a 
                      href={`tel:${c.phone}`}
                      className="w-10 h-10 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 italic">No emergency contacts added for this user.</p>
                </div>
              )}
            </div>
          </div>

        </GlassCard>

        {/* Footer Brand */}
        <div className="text-center text-[10px] text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Heart size={10} className="text-red-500" />
          <span>Powered by Aura Clinical Health Suite</span>
        </div>

      </div>
    </div>
  );
};

export default PublicEmergencyProfile;
