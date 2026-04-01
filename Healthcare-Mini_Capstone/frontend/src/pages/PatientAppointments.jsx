import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Clock, X, CheckCircle, Filter, Search } from 'lucide-react';
import { patientAPI, doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        patientAPI.getMyAppointments(),
        doctorAPI.getAllDoctors(),
      ]);
      setAppointments(apptsRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await patientAPI.bookAppointment({
        doctor_id: formData.get('doctor_id'),
        appointment_time: new Date(formData.get('appointment_time')).toISOString(),
        reason: formData.get('reason'),
      });
      toast.success('Appointment booked successfully!');
      setShowBooking(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to book appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch = apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { label: 'All', value: appointments.length, status: 'all' },
    { label: 'Upcoming', value: appointments.filter(a => a.status === 'booked').length, status: 'booked' },
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-500">Manage and track all your medical appointments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Book Appointment
          </motion.button>
        </div>
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
          placeholder="Search by doctor name or reason..."
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
            {searchTerm ? 'Try a different search term' : 'Book your first appointment to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowBooking(true)}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          )}
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
              <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Dr. {apt.doctor_name}</h3>
                      <p className="text-gray-500 mt-1">{apt.reason || 'General consultation'}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap self-start ${
                      apt.status === 'completed' ? 'badge-green' :
                      apt.status === 'cancelled' ? 'badge-red' : 'badge-yellow'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(apt.appointment_time), 'p')}
                    </span>
                    <span>{format(new Date(apt.appointment_time), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                  <p className="text-sm text-gray-500 mt-1">Schedule a visit with a doctor</p>
                </div>
                <button
                  onClick={() => setShowBooking(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBookAppointment} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Doctor
                  </label>
                  <select
                    name="doctor_id"
                    required
                    className="input-field"
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="appointment_time"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    name="reason"
                    rows="3"
                    className="input-field"
                    placeholder="Describe your symptoms or reason for visit"
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientAppointments;
