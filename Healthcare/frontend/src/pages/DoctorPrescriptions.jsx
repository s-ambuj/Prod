import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Calendar, Pill, Activity } from 'lucide-react';
import { doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await doctorAPI.getMyPrescriptions();
      setPrescriptions(res.data || []);
    } catch (error) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(presc => 
    presc.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presc.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presc.medicines?.some(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading prescriptions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
            <p className="text-gray-500">View all prescriptions you've created</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-3 rounded-xl border border-gray-200">
            <FileText className="w-5 h-5 text-green-600" />
            <span>{prescriptions.length} Prescriptions</span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient name, medicine, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium text-lg">No prescriptions found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Try a different search term' : 'Prescriptions you create will appear here'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions.map((presc, index) => (
            <motion.div
              key={presc.id || presc._id || `presc-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedId(expandedId === (presc.id || presc._id) ? null : (presc.id || presc._id))}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <Pill className="w-7 h-7" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{presc.patient_name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(presc.created_at), 'PP')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {presc.medicines?.length || 0} medicines
                        </span>
                      </div>
                    </div>
                    {presc.notes && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{presc.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Medicines */}
              {expandedId === (presc.id || presc._id) && presc.medicines && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 bg-gray-50 p-6"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Prescribed Medicines</h4>
                  <div className="space-y-3">
                    {presc.medicines.map((med, idx) => (
                      <div
                        key={`med-${presc.id || presc._id || index}-${idx}`}
                        className="bg-white rounded-xl p-4 border border-gray-100"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-green-600 font-semibold text-sm">{idx + 1}</span>
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{med.name}</p>
                              <p className="text-sm text-gray-500 mt-1">{med.dosage}</p>
                              {med.instructions && (
                                <p className="text-xs text-gray-400 mt-1">{med.instructions}</p>
                              )}
                            </div>
                          </div>
                          {med.days && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                              {med.days} days
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
