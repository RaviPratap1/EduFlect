import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api/services';
import toast from 'react-hot-toast';

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getCategories();
      setList(Array.isArray(data.data) ? data.data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  const createCategory = async (payload) => {
    try {
      const { data } = await api.createCategory(payload);
      toast.success('Category created!');
      setList((prev) => [...prev, data.data]);
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return { success: false };
    }
  };

  const updateCategory = async (id, payload) => {
    try {
      const { data } = await api.updateCategory(id, payload);
      toast.success('Category updated!');
      setList((prev) => prev.map((c) => c._id === id ? data.data : c));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return { success: false };
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted!');
      setList((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete');
    }
  };

  return (
    <CategoryContext.Provider value={{ list, loading, fetchCategories, createCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider');
  return ctx;
};
