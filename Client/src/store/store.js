import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import categoryReducer from './slices/categorySlice';
import enrollmentReducer from './slices/enrollmentSlice';

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    categories: categoryReducer,
    enrollment: enrollmentReducer,
  },
});