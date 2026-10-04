import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/services';
import toast from 'react-hot-toast';

const initialState = {
  list: [],
  total: 0,
  pages: 1,
  currentPage: 1,
  selected: null,
  instructorCourses: [],
  adminCourses: [],
  loading: false,
  error: null,
};

// ---------- Thunks ----------

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.getCourses(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourse = createAsyncThunk(
  'courses/fetchCourse',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.getCourse(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const fetchInstructorCourses = createAsyncThunk(
  'courses/fetchInstructorCourses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.getInstructorCourses();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch instructor courses');
    }
  }
);

export const fetchAdminCourses = createAsyncThunk(
  'courses/fetchAdminCourses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.adminGetAllCourses();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.createCourse(formData);
      toast.success('Course created!');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create course';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.updateCourse(id, formData);
      toast.success('Course updated!');
      return { id, updated: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update course';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteCourse(id);
      toast.success('Course deleted!');
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete course';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const togglePublish = createAsyncThunk(
  'courses/togglePublish',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.togglePublish(id);
      toast.success(data.message);
      return { id, isPublished: data.data.isPublished };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ---------- Slice ----------

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCourses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.courses;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchCourse
      .addCase(fetchCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchInstructorCourses
      .addCase(fetchInstructorCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.instructorCourses = action.payload;
      })
      .addCase(fetchInstructorCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAdminCourses
      .addCase(fetchAdminCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.adminCourses = action.payload;
      })
      .addCase(fetchAdminCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createCourse
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.instructorCourses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state) => {
        state.loading = false;
      })

      // updateCourse
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updated } = action.payload;
        state.instructorCourses = state.instructorCourses.map((c) =>
          c._id === id ? updated : c
        );
      })
      .addCase(updateCourse.rejected, (state) => {
        state.loading = false;
      })

      // deleteCourse
      .addCase(deleteCourse.fulfilled, (state, action) => {
        const id = action.payload;
        state.instructorCourses = state.instructorCourses.filter((c) => c._id !== id);
        state.adminCourses = state.adminCourses.filter((c) => c._id !== id);
      })

      // togglePublish
      .addCase(togglePublish.fulfilled, (state, action) => {
        const { id, isPublished } = action.payload;
        state.instructorCourses = state.instructorCourses.map((c) =>
          c._id === id ? { ...c, isPublished } : c
        );
        state.adminCourses = state.adminCourses.map((c) =>
          c._id === id ? { ...c, isPublished } : c
        );
      });
  },
});

export const { setSelected, clearError } = courseSlice.actions;
export default courseSlice.reducer;