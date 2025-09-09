import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ImageState {
  images: string[];
  loading: boolean;
  error: string | null;
  currentPrompt: string;
}

const initialState: ImageState = {
  images: [],
  loading: false,
  error: null,
  currentPrompt: '',
};

export const generateImage = createAsyncThunk(
  'images/generateImage',
  async (prompt: string) => {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.images;
  }
);

const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setCurrentPrompt: (state, action: PayloadAction<string>) => {
      state.currentPrompt = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearImages: (state) => {
      state.images = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(generateImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate image';
      });
  },
});

export const { setCurrentPrompt, clearError, clearImages } = imageSlice.actions;
export default imageSlice.reducer;