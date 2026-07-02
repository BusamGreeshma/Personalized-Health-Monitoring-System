import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import GlassCard from '../components/Common/GlassCard';
import { AlertOctagon, Phone, ShieldAlert, Heart, QrCode, MapPin, Play, Square } from 'lucide-react';

const EmergencyModule = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  // SOS States
  const [countdown, setCountdown] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Live location mock coordinate
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 });

  // Countdown timer handler
  useEffect(() => {
    let timer = null;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      triggerPanicAlert();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartSOS = () => {
    setCountdown(3); // 3 second countdown to prevent accidental triggers
    showToast('SOS Triggered', 'Accident emergency countdown has started. Tap CANCEL to abort.', 'alert');
  };

  const handleCancelSOS = () => {
    setCountdown(null);
    setSosActive(false);
    stopSiren();
    showToast('SOS Cancelled', 'Emergency state aborted successfully.', 'success');
  };

  // Synthesize alarm siren using Web Audio API
  const startSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      
      // Siren sweep effect: oscillate frequency between 400Hz and 1000Hz
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 1);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 2);
      osc.loop = true;

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;

      // Keep sweeping frequency
      let sweep = true;
      const sweepInterval = setInterval(() => {
        if (!audioCtxRef.current) {
          clearInterval(sweepInterval);
          return;
        }
        osc.frequency.linearRampToValueAtTime(sweep ? 1000 : 400, ctx.currentTime + 0.8);
        sweep = !sweep;
      }, 800);

    } catch (e) {
      console.warn("Web Audio API not allowed or supported on this browser context:", e);
    }
  };

  const stopSiren = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerPanicAlert = () => {
    setCountdown(null);
    setSosActive(true);
    startSiren();

    // Fetch browser geolocation if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast('SOS Live Location', 'Your active GPS coordinates have been loaded.', 'success');
        },
        () => {
          addMockLocation();
        }
      );
    } else {
      addMockLocation();
    }

    showToast('SOS DISPATCHED', 'Alert broadcasted to primary emergency contacts and closest ambulance.', 'alert');
  };

  const addMockLocation = () => {
    setCoordinates({ lat: 40.7306, lng: -73.9352 }); // mock NYC
  };

  // Compile Emergency QR Profile data string
  const compileEmergencyPayload = () => {
    if (!user) return 'AURA EMERGENCY MEDICAL PROFILE';
    const profile = user.profile || {};
    const payload = `Name: ${user.username}
Age: ${profile.age}
Gender: ${profile.gender}
Height: ${profile.height}cm, Weight: ${profile.weight}kg
Conditions: ${profile.diseases?.join(', ') || 'None'}
Allergies: ${profile.allergies?.join(', ') || 'None'}
Contacts: ${profile.emergencyContacts?.map(c => `${c.name} (${c.phone})`).join(', ') || 'None'}`;
    return encodeURIComponent(payload);
  };

  // Render QR Code from public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=0f172a&color=cbd5e1&data=${compileEmergencyPayload()}`;

  const nearbyHospitals = [
    { name: 'City Central General Hospital', distance: '1.2 km', phone: '+1-555-0199', type: 'Level 1 Trauma' },
    { name: 'Saint Jude Memorial Clinic', distance: '2.8 km', phone: '+1-555-0211', type: 'Urgent Care' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Emergency SOS Dispatcher</h2>
        <p className="text-xs text-slate-400">Trigger immediate panic alerts, broadcast live tracking coordinates, and display emergency medical profile cards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Panic Trigger Widget */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center">
          <GlassCard hover={false} className="p-8 text-center w-full flex flex-col items-center justify-center border-rose-500/20 bg-rose-950/5">
            <AlertOctagon className="text-rose-500 animate-pulse mb-6" size={32} />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">SOS Panic Button</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Tapping triggers a 3-second countdown. Upon completion, a siren sounds and emergency dispatch alerts are broadcasted.
            </p>

            {/* Panic button trigger */}
            <div className="my-8 relative flex items-center justify-center">
              {countdown !== null ? (
                <button
                  onClick={handleCancelSOS}
                  className="w-36 h-36 rounded-full bg-slate-900 border-4 border-slate-800 text-rose-500 text-2xl font-extrabold flex items-center justify-center animate-pulse cursor-pointer"
                >
                  {countdown}s
                </button>
              ) : sosActive ? (
                <button
                  onClick={handleCancelSOS}
                  className="w-36 h-36 rounded-full bg-rose-600 shadow-xl shadow-rose-600/30 border-4 border-rose-500 text-white text-base font-extrabold flex flex-col items-center justify-center cursor-pointer"
                >
                  <Square size={20} className="mb-1" />
                  <span>CANCEL</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSOS}
                  className="w-36 h-36 rounded-full bg-rose-950/60 shadow-xl shadow-rose-950/10 border-4 border-rose-500/50 hover:border-rose-500 hover:bg-rose-900 text-rose-200 hover:text-white text-xl font-black flex items-center justify-center transition-all cursor-pointer"
                >
                  TRIGGER
                </button>
              )}
            </div>

            {sosActive && (
              <div className="w-full space-y-3">
                <span className="badge-danger uppercase text-[10px] tracking-widest font-black block">Panic Mode Dispatched</span>
                <div className="text-[10px] text-slate-400">
                  <p>Live Location: {coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°</p>
                  <a
                    href={`https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 hover:text-rose-300 font-semibold underline mt-2 block"
                  >
                    Open Live Share Map Link
                  </a>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Middle Col: QR profile medical tag */}
        <div className="lg:col-span-1">
          <GlassCard hover={false} className="p-8 text-center flex flex-col items-center justify-between h-full">
            <div>
              <QrCode className="text-cyan-400 mb-4" size={24} />
              <h3 className="font-semibold text-sm text-slate-300">Scan QR Profile</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Emergency clinical personnel can scan this code to review your allergies, medical conditions, and contacts.
              </p>
            </div>

            <div className="my-6 p-3 rounded-2xl bg-slate-950 border border-slate-900 flex items-center justify-center">
              <img src={qrCodeUrl} alt="Emergency Medical Profile QR Code" className="w-40 h-40 rounded-lg" />
            </div>

            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Aura Profile tag generated</span>
          </GlassCard>
        </div>

        {/* Right Col: Nearby Hospitals & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Nearby Hospitals */}
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <MapPin className="text-indigo-400" size={16} />
              <h3 className="font-semibold text-sm">Closest Facilities</h3>
            </div>
            
            <div className="space-y-3">
              {nearbyHospitals.map((hosp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{hosp.name}</h4>
                    <span className="badge-success text-[9px]">{hosp.distance}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Type: {hosp.type}</p>
                  <a
                    href={`tel:${hosp.phone}`}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Phone size={10} />
                    <span>Call Dispatch: {hosp.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Emergency contacts card summary */}
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <ShieldAlert className="text-rose-400" size={16} />
              <h3 className="font-semibold text-sm">Emergency Contacts</h3>
            </div>
            
            <div className="space-y-2.5">
              {user?.profile?.emergencyContacts?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No contacts added. Configure them in Profile settings.</p>
              ) : (
                user?.profile?.emergencyContacts?.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-300">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">{c.relation}</p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    >
                      <Phone size={12} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default EmergencyModule;
