import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, FileText, User, CheckCircle, XCircle, Clock, Users, Activity, X, Plus, ChevronRight } from 'lucide-react';
import { doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptsRes, prescRes, profileRes] = await Promise.all([
        doctorAPI.getMyAppointments(),
        doctorAPI.getMyPrescriptions(),
        doctorAPI.getProfile(),
      ]);
      setAppointments(apptsRes.data || []);
      setPrescriptions(prescRes.data || []);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const medicines = formData.get('medicines').split('\n').map(line => {
      const [name, dosage, days, instructions] = line.split('|');
      return { name: name?.trim(), dosage: dosage?.trim(), days: parseInt(days), instructions: instructions?.trim() };
    }).filter(m => m.name);

    try {
      await doctorAPI.createPrescription({
        appointment_id: selectedAppointment.id || selectedAppointment._id,
        notes: formData.get('notes'),
        medicines,
      });
      toast.success('Prescription created successfully!');
      setShowPrescription(false);
      setSelectedAppointment(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create prescription');
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'booked');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  const stats = [
    { label: 'Pending', value: pendingAppointments.length, icon: Clock, color: 'yellow' },
    { label: 'Completed', value: completedAppointments.length, icon: CheckCircle, color: 'green' },
    { label: 'Prescriptions', value: prescriptions.length, icon: FileText, color: 'blue' },
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
    <div className="min-h-screen pb-24">
      {/* Header Section */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dr. {user?.name}</h1>
                <p className="text-blue-100 mt-1">{profile?.specialization || 'Medical Professional'}</p>
              </div>
            </div>
            {profile && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl">
                  <Activity className="w-4 h-4" />
                  <span>{profile.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl">
                  <Users className="w-4 h-4" />
                  <span>{appointments.length} patients</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 relative z-10 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl shadow-blue-500/5 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'yellow' ? 'bg-yellow-100' :
                  stat.color === 'green' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    stat.color === 'green' ? 'text-green-600' : 'text-blue-600'
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
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Today's Appointments</h2>
                    <p className="text-sm text-gray-500">{appointments.length} total</p>
                  </div>
                </div>
                <Link to="/doctor/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No appointments yet</p>
                  <p className="text-sm text-gray-400 mt-1">Patient appointments will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt, index) => (
                    <motion.div
                      key={apt.id || apt._id || `apt-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{apt.reason || 'General consultation'}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          apt.status === 'completed' ? 'badge-green' :
                          apt.status === 'cancelled' ? 'badge-red' : 'badge-yellow'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(apt.appointment_time), 'PPp')}</span>
                      </div>
                      {apt.status === 'booked' && (
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUpdateStatus(apt.id || apt._id, 'completed')}
                            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUpdateStatus(apt.id || apt._id, 'cancelled')}
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowPrescription(true);
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Prescribe
                          </motion.button>
                        </div>
                      )}
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
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-green-50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Prescriptions</h2>
                    <p className="text-sm text-gray-500">{prescriptions.length} total</p>
                  </div>
                </div>
                <Link to="/doctor/prescriptions" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {prescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No prescriptions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create prescriptions from completed appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((presc, index) => (
                    <motion.div
                      key={presc.id || presc._id || `presc-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="prescription-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{presc.patient_name}</p>
                          <p className="text-sm text-gray-500">{format(new Date(presc.created_at), 'PP')}</p>
                        </div>
                        <Activity className="w-5 h-5 text-green-500" />
                      </div>
                      {presc.notes && (
                        <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded-lg">{presc.notes}</p>
                      )}
                      <div className="space-y-2">
                        {presc.medicines?.slice(0, 3).map((med, idx) => (
                          <div key={`med-${presc.id || presc._id || index}-${idx}`} className="flex items-center gap-3 text-sm bg-white p-2 rounded-lg border border-gray-100">
                            <span className="w-2 h-2 bg-green-400 rounded-full shrink-0"></span>
                            <span className="font-medium text-gray-700 flex-1">{med.name}</span>
                            <span className="text-gray-500 text-xs">{med.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prescription Modal */}
      <AnimatePresence>
        {showPrescription && selectedAppointment && (
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
                  <h2 className="text-2xl font-bold text-gray-900">Create Prescription</h2>
                  <p className="text-sm text-gray-500 mt-1">Patient: {selectedAppointment.patient_name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPrescription(false);
                    setSelectedAppointment(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreatePrescription} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    className="input-field"
                    placeholder="Additional notes for the patient"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medicines
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    One medicine per line: <code className="bg-gray-100 px-1 rounded">name | dosage | days | instructions</code>
                  </p>
                  <textarea
                    name="medicines"
                    rows="5"
                    required
                    className="input-field font-mono text-sm"
                    placeholder="Paracetamol | 500mg twice daily | 5 | Take after meals&#10;Amoxicillin | 250mg three times daily | 7 | Complete full course"
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrescription(false);
                      setSelectedAppointment(null);
                    }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all font-semibold"
                  >
                    Create Prescription
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

export default DoctorDashboard;
