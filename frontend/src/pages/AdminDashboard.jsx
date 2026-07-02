import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/Common/GlassCard';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShieldCheck, Users, ClipboardList, MessageSquare, Trash2, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [updatingUser, setUpdatingUser] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // 1. Fetch stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch users list
      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve administrative analytics.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingUser(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      if (res.data.success) {
        showToast('Role Updated', `User promoted/demoted successfully.`, 'success');
        fetchAdminData();
      }
    } catch (error) {
      showToast('Error', 'Failed to update user authorization role.', 'alert');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all associated health logs?")) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('User Deleted', 'Account removed from system records.', 'success');
        fetchAdminData();
      }
    } catch (error) {
      showToast('Error', 'Failed to remove user account.', 'alert');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} height="h-32" className="mt-8" />;
  }

  // Compile charts demographics data
  const genderData = stats?.demographics?.genderRatio ? [
    { name: 'Male', count: stats.demographics.genderRatio.Male || 0 },
    { name: 'Female', count: stats.demographics.genderRatio.Female || 0 },
    { name: 'Other', count: stats.demographics.genderRatio.Other || 0 }
  ] : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Admin Console</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage user authorization roles, inspect AI usage rates, and audit biometrics databases.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Users count */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Registered Users</span>
            <p className="text-xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
          </div>
        </GlassCard>

        {/* Logs count */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
            <ClipboardList size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Database Vitals Logs</span>
            <p className="text-xl font-bold text-white mt-1">{stats?.totalLogs || 0}</p>
          </div>
        </GlassCard>

        {/* AI chat sessions */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/10">
            <MessageSquare size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Chat sessions</span>
            <p className="text-xl font-bold text-white mt-1">{stats?.aiUsage?.sessions || 0}</p>
          </div>
        </GlassCard>

        {/* AI messages count */}
        <GlassCard hover={false} className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total AI Prompts</span>
            <p className="text-xl font-bold text-white mt-1">{stats?.aiUsage?.messages || 0}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Users list table (span 2) */}
        <div className="lg:col-span-2">
          <GlassCard hover={false} className="space-y-4 border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">User Account Records</span>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">Email</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {users.map(u => (
                    <tr key={u._id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-900/10">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{u.username}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3 capitalize">
                        <span className={u.role === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-right flex justify-end gap-2.5">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          disabled={updatingUser === u._id}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-indigo-500/30 text-indigo-400 cursor-pointer"
                          title="Toggle Admin Privilege"
                        >
                          <Shield size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-rose-500/30 text-rose-400 cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Demographics Charts */}
        <div className="space-y-6">
          <GlassCard hover={false} className="space-y-4">
            <h3 className="font-semibold text-sm">User Demographics Gender Ratio</h3>
            <div className="h-60 w-full">
              {genderData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">No demographics loaded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
