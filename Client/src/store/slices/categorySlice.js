import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

const initialState = {
  list: [],
  loading: false,
};

// ---------- Thunks ----------

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const { data } = await api.getCategories();
    return Array.isArray(data.data) ? data.data : [];
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.createCategory(payload);
      toast.success('Category created!');
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.updateCategory(id, payload);
      toast.success('Category updated!');
      return { id, updated: data.data };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted!');
      return id;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ---------- Slice ----------

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.loading = false;
      })

      // createCategory
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // updateCategory
      .addCase(updateCategory.fulfilled, (state, action) => {
        const { id, updated } = action.payload;
        state.list = state.list.map((c) => (c._id === id ? updated : c));
      })

      // deleteCategory
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((c) => c._id !== id);
      });
  },
});

export default categorySlice.reducer;