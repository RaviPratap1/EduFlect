import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

const initialState = {
  enrollments: [],
  loading: false,
};

// ---------- Thunks ----------

export const fetchEnrollments = createAsyncThunk(
  'enrollment/fetchEnrollments',
  async () => {
    const { data } = await api.getMyEnrollments();
    return data.data;
  }
);

export const markComplete = createAsyncThunk(
  'enrollment/markComplete',
  async (payload, { rejectWithValue }) => {
    try {
      await api.markComplete(payload);
      return payload;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const markIncomplete = createAsyncThunk(
  'enrollment/markIncomplete',
  async (payload, { rejectWithValue }) => {
    try {
      await api.markIncomplete(payload);
      return payload;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ---------- Slice ----------

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state) => {
        state.loading = false;
      });
    // markComplete/markIncomplete ka original context me koi local state update nahi tha
    // (list refresh nahi ho rahi thi), isliye extra cases add nahi kiye.
    // Agar UI me turant reflect karna hai to niche wale note dekho.
  },
});

export default enrollmentSlice.reducer;
