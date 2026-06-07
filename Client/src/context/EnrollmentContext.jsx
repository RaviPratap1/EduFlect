import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api/services';
import toast from 'react-hot-toast';

const EnrollmentContext = createContext(null);

export function EnrollmentProvider({ children }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getMyEnrollments();
      setEnrollments(data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  const markComplete = async (payload) => {
    try {
      await api.markComplete(payload);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const markIncomplete = async (payload) => {
    try {
      await api.markIncomplete(payload);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <EnrollmentContext.Provider value={{ enrollments, loading, fetchEnrollments, markComplete, markIncomplete }}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export const useEnrollment = () => {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) throw new Error('useEnrollment must be used within EnrollmentProvider');
  return ctx;
};
