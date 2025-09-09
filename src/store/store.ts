import { configureStore } from '@reduxjs/toolkit';
import imageSlice from './slices/imageSlice';

export const store = configureStore({
  reducer: {
    images: imageSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;