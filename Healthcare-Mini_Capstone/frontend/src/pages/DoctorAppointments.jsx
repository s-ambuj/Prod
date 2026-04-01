import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Plus, FileText, Search, Filter } from 'lucide-react';
import { doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await doctorAPI.getMyAppointments();
      setAppointments(res.data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch = apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { label: 'All', value: appointments.length, status: 'all' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'booked').length, status: 'booked' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, status: 'completed' },
    { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, status: 'cancelled' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-500">Manage your patient appointments</p>
      </motion.div>

      {/* Stats Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {stats.map((stat) => (
          <motion.button
            key={stat.status}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(stat.status)}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              filter === stat.status
                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {stat.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${
              filter === stat.status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {stat.value}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient name or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium text-lg">No appointments found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Try a different search term' : 'Your patient appointments will appear here'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt, index) => (
            <motion.div
              key={apt.id || apt._id || `apt-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Date Badge */}
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-md">
                  <span className="text-xl font-bold leading-none">
                    {format(new Date(apt.appointment_time), 'd')}
                  </span>
                  <span className="text-xs opacity-80">
                    {format(new Date(apt.appointment_time), 'MMM')}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{apt.patient_name}</h3>
                      <p className="text-gray-500">{apt.reason || 'General consultation'}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap self-start ${
                      apt.status === 'completed' ? 'badge-green' :
                      apt.status === 'cancelled' ? 'badge-red' : 'badge-yellow'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(apt.appointment_time), 'p')}
                    </span>
                    <span>{format(new Date(apt.appointment_time), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>

                {/* Actions */}
                {apt.status === 'booked' && (
                  <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus(apt.id || apt._id, 'completed')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus(apt.id || apt._id, 'cancelled')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
