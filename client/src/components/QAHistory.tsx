// client/src/components/QAHistory.tsx
import React from 'react';
import type { QAHistory } from '../types/transcript';

interface QAHistoryProps {
  history: QAHistory[];
  loading?: boolean;
}

const QAHistoryComponent: React.FC<QAHistoryProps> = ({ history, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Question & Answer History</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading history...</span>
          </div>
        </div>
        );
    }
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Question & Answer History</h2>
        <p className="text-gray-500 text-center py-8">No questions asked yet. Start by asking a question above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Question & Answer History</h2>
      
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {history.map((entry) => (
          <div key={entry.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="mb-3">
              <div className="flex items-start space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Q
                </span>
                <p className="text-sm font-medium text-gray-900 flex-1">
                  {entry.question}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {entry.timestamp.toLocaleString()}
              </p>
            </div>
            
            <div className="ml-6">
              <div className="flex items-start space-x-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  A
                </span>
                <p className="text-sm text-gray-700 flex-1">
                  {entry.response.answer}
                </p>
              </div>
              
              {entry.response.relevantQuotes.length > 0 && (
                <div className="ml-6 mt-3">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Relevant Quotes:</h4>
                  <div className="space-y-1">
                    {entry.response.relevantQuotes.map((quote, index) => (
                      <p key={index} className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                        "{quote}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {entry.response.confidence > 0 && (
                <div className="ml-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${entry.response.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(entry.response.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QAHistoryComponent;