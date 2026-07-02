import React, { useState } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import { useNotification } from '../context/NotificationContext';
import { Watch, ShieldCheck, Zap, Activity, Info, RefreshCw } from 'lucide-react';

const WearableIntegration = () => {
  const { showToast } = useNotification();
  const [syncing, setSyncing] = useState(false);
  const [activeMeds, setActiveMeds] = useState({ fitbit: true, apple: false, google: true });
  const [logs, setLogs] = useState([
    "System: Bluetooth BLE listener initialization complete.",
    "System: Device authorization vectors verified."
  ]);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleSyncDevice = async (device) => {
    setSyncing(true);
    addLog(`Initiating sync request for device: ${device}...`);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post('/logs/sync-wearable', { date: todayStr });

      if (res.data.success) {
        addLog(`Device ${device}: Handshake successful.`);
        addLog(`Device ${device}: Fetched Steps: ${res.data.data.stepCount}, Sleep: ${res.data.data.sleepHours} hrs, HR: ${res.data.data.heartRate} bpm.`);
        addLog(`System: Synced daily logs summary database.`);
        showToast('Wearable Synced', `Handshake completed with ${device} telemetry.`, 'success');
      }
    } catch (error) {
      addLog(`Error: Connection timeout. Handshake failed.`);
      showToast('Sync Error', 'Failed to synchronize with wearable API.', 'alert');
    } finally {
      setSyncing(false);
    }
  };

  const handleSimulateAlert = async (type) => {
    setSyncing(true);
    addLog(`Simulation: Triggering vitals event [${type}]...`);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      let payload = { date: todayStr };
      if (type === 'heart') {
        payload.heartRate = 145; // tachycardia spike simulation
        addLog("Simulation: Injecting heart rate spike telemetry (145 bpm).");
      } else if (type === 'sugar') {
        payload.bloodSugar = 165; // hyperglycemia spike simulation
        addLog("Simulation: Injecting elevated blood sugar telemetry (165 mg/dL).");
      } else {
        payload.stepCount = 12500; // sprint steps simulation
        addLog("Simulation: Injecting high step log telemetry (12,500 steps).");
      }

      const res = await api.post('/logs/health', payload);
      if (res.data.success) {
        addLog(`System: Synced logs successfully. Updated vitals stored.`);
        showToast('Vitals Event Triggered', 'Simulated telemetry has updated dashboard metrics.', 'success');
      }
    } catch (error) {
      addLog(`Error: Failed to process telemetry simulation event.`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wearable Device Integration</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Establish authorization tokens and simulate biometrics sync with Fitbit, Apple Health, or Google Fit.</p>
      </div>

      {/* Info Warning */}
      <div className="p-3.5 rounded-xl bg-indigo-950/15 border border-indigo-500/25 text-indigo-400 text-xs flex gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Because clinical device APIs require custom corporate certificates, we have built a BLE Handshake Simulator below. This lets you mock sensor anomalies to demonstrate how the diagnostic engine responds.</span>
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Fitbit Card */}
        <GlassCard hover={false} className={`p-6 border flex flex-col justify-between h-56 transition-all ${
          activeMeds.fitbit ? 'border-cyan-500/30 bg-cyan-950/5' : 'border-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="font-bold text-base text-slate-800 dark:text-slate-200">Fitbit Sync</span>
              <Watch size={18} className="text-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Continuous sync for step count meters, active metabolic rate, and sleep state intervals.</p>
          </div>
          <div className="flex justify-between items-center mt-6">
            <span className="badge-success text-[10px]">Active BLE</span>
            <button
              onClick={() => handleSyncDevice('Fitbit')}
              disabled={syncing}
              className="glass-btn-primary py-1.5 px-3.5 text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} />
              <span>Sync now</span>
            </button>
          </div>
        </GlassCard>

        {/* Google Fit Card */}
        <GlassCard hover={false} className={`p-6 border flex flex-col justify-between h-56 transition-all ${
          activeMeds.google ? 'border-rose-500/30 bg-rose-950/5' : 'border-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="font-bold text-base text-slate-800 dark:text-slate-200">Google Fit API</span>
              <Watch size={18} className="text-rose-400" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Aggregates distance maps, resting heart rate values, and caloric logs sync.</p>
          </div>
          <div className="flex justify-between items-center mt-6">
            <span className="badge-success text-[10px]">Active API</span>
            <button
              onClick={() => handleSyncDevice('Google Fit')}
              disabled={syncing}
              className="glass-btn-primary py-1.5 px-3.5 text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} />
              <span>Sync now</span>
            </button>
          </div>
        </GlassCard>

        {/* Apple Health Card */}
        <GlassCard hover={false} className={`p-6 border flex flex-col justify-between h-56 transition-all ${
          activeMeds.apple ? 'border-indigo-500/30 bg-indigo-950/5' : 'border-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="font-bold text-base text-slate-800 dark:text-slate-200">Apple HealthKit</span>
              <Watch size={18} className="text-indigo-400" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Pulls ECG biometrics, SpO2 blood oxygen levels, and dynamic sleep logs.</p>
          </div>
          <div className="flex justify-between items-center mt-6">
            <span className="badge-warning text-[10px] bg-slate-900 border border-slate-800 text-slate-500 dark:text-slate-400">Offline</span>
            <button
              onClick={() => {
                setActiveMeds(prev => ({ ...prev, apple: true }));
                addLog("System: Authorized Apple HealthKit sandbox permissions.");
              }}
              className="glass-btn-secondary py-1.5 px-3.5 text-[10px] cursor-pointer"
            >
              Authorize
            </button>
          </div>
        </GlassCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Simulation Event Injector */}
        <div className="lg:col-span-1">
          <GlassCard hover={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Zap className="text-amber-400" size={16} />
              <h3 className="font-semibold text-sm">Biometrics Sensor Simulator</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Inject raw vital anomalies into Aura logs to test warnings responses:</p>
            
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleSimulateAlert('heart')}
                disabled={syncing}
                className="w-full glass-btn-secondary py-2 text-left px-3 text-xs flex items-center justify-between hover:border-rose-500/30 hover:bg-rose-950/10 cursor-pointer"
              >
                <span>Trigger Heart Rate Spike (145 bpm)</span>
                <Activity size={12} className="text-rose-400 animate-pulse" />
              </button>
              <button
                onClick={() => handleSimulateAlert('sugar')}
                disabled={syncing}
                className="w-full glass-btn-secondary py-2 text-left px-3 text-xs flex items-center justify-between hover:border-amber-500/30 hover:bg-amber-950/10 cursor-pointer"
              >
                <span>Trigger Glucose Spike (165 mg/dL)</span>
                <Activity size={12} className="text-amber-400" />
              </button>
              <button
                onClick={() => handleSimulateAlert('steps')}
                disabled={syncing}
                className="w-full glass-btn-secondary py-2 text-left px-3 text-xs flex items-center justify-between hover:border-indigo-500/30 hover:bg-indigo-950/10 cursor-pointer"
              >
                <span>Trigger Steps Sprint (12,500 steps)</span>
                <Activity size={12} className="text-indigo-400" />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Col: Console logs output */}
        <div className="lg:col-span-2">
          <GlassCard hover={false} className="space-y-4 border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">BLE Handshake Stream Console</span>
            <div className="h-60 rounded-xl bg-slate-950 p-4 border border-slate-900 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className={log.includes('Error') ? 'text-rose-400' : log.includes('handshake') || log.includes('HANDSHAKE') || log.includes(' Handshake') ? 'text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default WearableIntegration;
