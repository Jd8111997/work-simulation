// client/src/components/TranscriptDisplay.tsx
import React from 'react';
import type { TranscriptEntry } from '../types/transcript';

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  loading: boolean;
  error: string | null;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading transcript...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Transcript</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Therapy Session Transcript</h2>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {transcript.map((entry, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              entry.speaker === 'Therapist'
                ? 'bg-blue-50 border-l-4 border-blue-400'
                : 'bg-green-50 border-l-4 border-green-400'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                entry.speaker === 'Therapist'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {entry.speaker}
              </span>
              <p className="text-gray-900 text-sm leading-relaxed flex-1">
                {entry.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {transcript.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-8">No transcript data available.</p>
      )}
    </div>
  );
};

export default TranscriptDisplay;