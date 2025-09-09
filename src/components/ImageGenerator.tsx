'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { generateImage, setCurrentPrompt, clearImages } from '@/store/slices/imageSlice';

export default function ImageGenerator() {
  const dispatch = useAppDispatch();
  const { images, loading, error, currentPrompt } = useAppSelector((state) => state.images);
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      dispatch(setCurrentPrompt(prompt));
      dispatch(generateImage(prompt));
    }
  };

  const handleClear = () => {
    dispatch(clearImages());
    setPrompt('');
    dispatch(setCurrentPrompt(''));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          AI Image Generator
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white-900"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-2">Generating your image...</p>
          </div>
        )}

        {currentPrompt && (
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <p className="text-white">
              <span className="font-semibold">Prompt:</span> {currentPrompt}
            </p>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((imageUrl, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4">
                <img
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <button
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  View Full Size
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}