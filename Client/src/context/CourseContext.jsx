import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api/services';
import toast from 'react-hot-toast';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async (params) => {
    try {
      setLoading(true);
      const { data } = await api.getCourses(params);
      setList(data.data.courses);
      setTotal(data.data.total);
      setPages(data.data.pages);
      setCurrentPage(data.data.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally { setLoading(false); }
  }, []);

  const fetchCourse = useCallback(async (id) => {
    try {
      setLoading(true);
      const { data } = await api.getCourse(id);
      setSelected(data.data);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch course');
    } finally { setLoading(false); }
  }, []);

  const fetchInstructorCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getInstructorCourses();
      setInstructorCourses(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch instructor courses');
    } finally { setLoading(false); }
  }, []);

  const fetchAdminCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.adminGetAllCourses();
      setAdminCourses(data.data);
    } catch (err) {
      setError(err.response?.data?.message);
    } finally { setLoading(false); }
  }, []);

  const createCourse = async (formData) => {
    try {
      setLoading(true);
      const { data } = await api.createCourse(formData);
      toast.success('Course created!');
      setInstructorCourses((prev) => [data.data, ...prev]);
      return { success: true, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create course';
      toast.error(msg);
      return { success: false };
    } finally { setLoading(false); }
  };

  const updateCourse = async (id, formData) => {
    try {
      setLoading(true);
      const { data } = await api.updateCourse(id, formData);
      toast.success('Course updated!');
      setInstructorCourses((prev) => prev.map((c) => c._id === id ? data.data : c));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update course';
      toast.error(msg);
      return { success: false };
    } finally { setLoading(false); }
  };

  const deleteCourse = async (id) => {
    try {
      await api.deleteCourse(id);
      toast.success('Course deleted!');
      setInstructorCourses((prev) => prev.filter((c) => c._id !== id));
      setAdminCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const togglePublish = async (id) => {
    try {
      const { data } = await api.togglePublish(id);
      toast.success(data.message);
      const update = (list) => list.map((c) => c._id === id ? { ...c, isPublished: data.data.isPublished } : c);
      setInstructorCourses(update);
      setAdminCourses(update);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <CourseContext.Provider value={{ list, total, pages, currentPage, selected, instructorCourses, adminCourses, loading, error, fetchCourses, fetchCourse, fetchInstructorCourses, fetchAdminCourses, createCourse, updateCourse, deleteCourse, togglePublish, setSelected }}>
      {children}
    </CourseContext.Provider>
  );
}

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within CourseProvider');
  return ctx;
};
