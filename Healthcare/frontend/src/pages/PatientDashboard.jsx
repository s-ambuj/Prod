import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Plus, Clock, Activity, TrendingUp, ChevronRight, X, CheckCircle } from 'lucide-react';
import { patientAPI, doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptsRes, prescRes, docsRes] = await Promise.all([
        patientAPI.getMyAppointments(),
        patientAPI.getMyPrescriptions(),
        doctorAPI.getAllDoctors(),
      ]);
      setAppointments(apptsRes.data || []);
      setPrescriptions(prescRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
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

  const upcomingAppointments = appointments.filter(a => a.status === 'booked');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  const stats = [
    { label: 'Upcoming', value: upcomingAppointments.length, icon: Calendar, color: 'blue', trend: '+2 this week' },
    { label: 'Completed', value: completedAppointments.length, icon: CheckCircle, color: 'green', trend: 'Total visits' },
    { label: 'Prescriptions', value: prescriptions.length, icon: FileText, color: 'purple', trend: 'Active meds' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-500">
              Here's an overview of your health journey.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Book Appointment
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover stat-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  {stat.trend}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <stat.icon className={`w-7 h-7 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' : 'text-purple-600'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My Appointments</h2>
                  <p className="text-sm text-gray-500">{appointments.length} total</p>
                </div>
              </div>
              <Link to="/patient/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No appointments yet</p>
                <p className="text-sm text-gray-400 mt-1">Book your first appointment to get started</p>
                <button
                  onClick={() => setShowBooking(true)}
                  className="mt-4 text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1"
                >
                  Book now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt, index) => (
                  <motion.div
                    key={apt.id || apt._id || `apt-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="appointment-card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-md">
                        <span className="text-lg font-bold leading-none">
                          {format(new Date(apt.appointment_time), 'd')}
                        </span>
                        <span className="text-xs opacity-80">
                          {format(new Date(apt.appointment_time), 'MMM')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">Dr. {apt.doctor_name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{apt.reason || 'General consultation'}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            apt.status === 'completed' ? 'badge-green' :
                            apt.status === 'cancelled' ? 'badge-red' : 'badge-yellow'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(apt.appointment_time), 'p')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Prescriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My Prescriptions</h2>
                  <p className="text-sm text-gray-500">{prescriptions.length} active</p>
                </div>
              </div>
              <Link to="/patient/prescriptions" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No prescriptions yet</p>
                <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here after your appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 5).map((presc, index) => (
                  <motion.div
                    key={presc.id || presc._id || `presc-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="prescription-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Dr. {presc.doctor_name}</p>
                        <p className="text-sm text-gray-500">{format(new Date(presc.created_at), 'PP')}</p>
                      </div>
                      <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    {presc.notes && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">{presc.notes}</p>
                    )}
                    <div className="space-y-2">
                      {presc.medicines?.slice(0, 3).map((med, idx) => (
                        <div key={`med-${presc.id || presc._id || index}-${idx}`} className="flex items-center gap-3 text-sm bg-white p-2 rounded-lg border border-gray-100">
                          <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                          <span className="font-medium text-gray-700 flex-1">{med.name}</span>
                          <span className="text-gray-500 text-xs">{med.dosage}</span>
                        </div>
                      ))}
                      {presc.medicines?.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">+{presc.medicines.length - 3} more medicines</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

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
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
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

export default PatientDashboard;
