import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { FileText, Upload, AlertCircle, Check, Trash2, ArrowUpRight } from 'lucide-react';

const MedicalReportAnalyzer = () => {
  const { showToast } = useNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      if (res.data.success) {
        setReports(res.data.data);
        if (res.data.data.length > 0 && !selectedReport) {
          setSelectedReport(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve medical reports history.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('report', file);

    setUploading(true);
    showToast('Uploading Report', 'Gemini AI OCR is parsing telemetry values...', 'info');

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        showToast('Analysis Completed', 'Successfully analyzed report parameters.', 'success');
        setReports(prev => [res.data.data, ...prev]);
        setSelectedReport(res.data.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Parsing Failed', 'AI vision was unable to process report format.', 'alert');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      const res = await api.delete(`/reports/${id}`);
      if (res.data.success) {
        showToast('Report Deleted', 'Report removed successfully.', 'success');
        const updated = reports.filter(r => r._id !== id);
        setReports(updated);
        if (selectedReport?._id === id) {
          setSelectedReport(updated.length > 0 ? updated[0] : null);
        }
      }
    } catch (error) {
      showToast('Error', 'Failed to delete report.', 'alert');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} height="h-32" className="mt-8" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Medical Report Analyzer</h2>
        <p className="text-xs text-slate-400">Extract blood panel telemetry values directly using Gemini Multimodal Vision OCR.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload & Report list drawer */}
        <div className="space-y-6">
          {/* File Upload Box */}
          <GlassCard hover={false} className="p-6 text-center border-dashed border-slate-700/60 bg-slate-900/10">
            <Upload size={32} className="mx-auto text-indigo-400 mb-3 animate-bounce" />
            <h4 className="text-xs font-bold text-slate-200">Upload Blood Report</h4>
            <p className="text-[10px] text-slate-500 mt-1">Accepts images (PNG, JPG) or PDF files up to 10MB.</p>
            
            <label className="mt-4 inline-flex justify-center glass-btn-primary py-2 px-4 text-xs w-full cursor-pointer">
              <span>{uploading ? 'Processing OCR...' : 'Select File'}</span>
              <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </GlassCard>

          {/* Reports History */}
          <GlassCard hover={false} className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Report History</span>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center py-6">No reports uploaded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {reports.map(r => (
                  <div
                    key={r._id}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center justify-between transition-all ${
                      selectedReport?._id === r._id
                        ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400'
                        : 'border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="flex-shrink-0" />
                      <span className="truncate">{r.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(r._id);
                      }}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Analysis Display */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <GlassCard hover={false} className="space-y-6">
              
              {/* Header Info */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{selectedReport.title}</h3>
                  <span className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase mt-1 inline-block">
                    {selectedReport.fileType} Document • Analysed {new Date(selectedReport.analyzedAt).toLocaleDateString()}
                  </span>
                </div>
                <a
                  href={`http://localhost:5000${selectedReport.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  <span>View Original</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Diagnostic Summary</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl">
                  {selectedReport.aiSummary}
                </p>
              </div>

              {/* Abnormal Values Parameter Vitals list */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Extracted Vitals & Values</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                        <th className="py-2.5">Parameter</th>
                        <th className="py-2.5">Observed Value</th>
                        <th className="py-2.5">Standard Reference</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {selectedReport.abnormalValues.map((val, idx) => (
                        <tr key={idx} className="text-slate-300 font-medium hover:bg-slate-900/10">
                          <td className="py-3 font-semibold text-slate-200">{val.parameter}</td>
                          <td className="py-3">{val.value}</td>
                          <td className="py-3 text-slate-400">{val.normalRange}</td>
                          <td className="py-3 text-right">
                            <span className={
                              val.status === 'high' ? 'badge-danger' : val.status === 'low' ? 'badge-warning' : 'badge-success'
                            }>
                              {val.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lifestyle Suggestions */}
              <div className="space-y-3 pt-3 border-t border-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Lifestyle & Diet Recommendations</span>
                <div className="space-y-2">
                  {selectedReport.lifestyleSuggestions.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/20 border border-slate-900 flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="text-indigo-400 mt-0.5">✦</span>
                      <p>{s}</p>
                    </div>
                  ))}
                </div>
              </div>

            </GlassCard>
          ) : (
            <GlassCard hover={false} className="h-96 flex flex-col items-center justify-center text-slate-500 text-xs italic">
              <AlertCircle size={28} className="text-slate-600 mb-2" />
              <span>Select a medical report or upload a new one to run OCR analyzer.</span>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};

export default MedicalReportAnalyzer;
