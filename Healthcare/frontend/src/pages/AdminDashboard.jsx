import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Activity, FileText, Calendar, Shield, TrendingUp, ChevronRight, X, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, pendingRes, reportsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getPendingDoctors(),
        adminAPI.getReports(),
      ]);
      setUsers(usersRes.data?.users || []);
      setPendingDoctors(pendingRes.data || []);
      setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (id) => {
    try {
      await adminAPI.approveDoctor(id);
      toast.success('Doctor approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'pending', label: 'Pending Doctors', icon: UserCheck, badge: pendingDoctors.length },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-purple-100 mt-1">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>System Overview</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.badge > 0 && (
                <span className={`absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                  activeTab === tab.id ? 'bg-white text-purple-600' : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && reports && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.users?.total || 0}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Patients</span>
                    <span className="font-semibold text-gray-900">{reports.users?.patients || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Doctors</span>
                    <span className="font-semibold text-gray-900">{reports.users?.doctors || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Admins</span>
                    <span className="font-semibold text-gray-900">{reports.users?.admins || 0}</span>
                  </div>
                </div>
              </motion.div>

              {/* Appointments Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.appointments?.total || 0}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                    <span className="text-sm text-gray-600">Booked</span>
                    <span className="font-semibold text-yellow-700">{reports.appointments?.booked || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold text-green-700">{reports.appointments?.completed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-700">{reports.appointments?.cancelled || 0}</span>
                  </div>
                </div>
              </motion.div>

              {/* Prescriptions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prescriptions</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.prescriptions?.total || 0}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                    <span className="text-sm text-gray-600">Pending Doctors</span>
                    <span className="font-semibold text-orange-700">{reports.users?.pending_doctors || 0}</span>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">System Health</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">All systems operational</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                  <p className="text-indigo-100">Manage your healthcare platform efficiently</p>
                </div>
                <div className="flex gap-3">
                  {pendingDoctors.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('pending')}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg"
                    >
                      <UserPlus className="w-5 h-5" />
                      Approve Doctors ({pendingDoctors.length})
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('users')}
                    className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-lg text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    Manage Users
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">All Users</h2>
                    <p className="text-sm text-gray-500">{users.length} registered users</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <motion.tr
                      key={u.id || u._id || `user-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          u.role === 'admin' ? 'badge-purple' :
                          u.role === 'doctor' ? 'badge-blue' : 'badge-green'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-2 text-sm ${
                          u.is_active ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pending Doctors Tab */}
        {activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Pending Doctor Approvals</h2>
                  <p className="text-sm text-gray-500">{pendingDoctors.length} doctors awaiting approval</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {pendingDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-gray-500 font-medium">All caught up!</p>
                  <p className="text-sm text-gray-400 mt-1">No pending doctor approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id || doctor._id || `doctor-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">Dr. {doctor.name}</p>
                          <p className="text-sm text-gray-500">{doctor.email}</p>
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full mt-1">
                            <Clock className="w-3 h-3" />
                            Awaiting approval
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApproveDoctor(doctor.id)}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all"
                      >
                        <UserCheck className="w-5 h-5" />
                        Approve
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
