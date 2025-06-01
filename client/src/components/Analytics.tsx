// client/src/components/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

interface AnalyticsData {
  success: boolean;
  transcriptInfo: {
    source: string;
    description: string;
  };
  analytics: {
    totalQuestions: number;
    avgConfidence: number;
    mostAskedQuestions: string[];
  };
  recentActivity: Array<{
    question: string;
    confidence: number;
    askedAt: string;
    answerPreview: string;
  }>;
  generatedAt: string;
  error?: string;
}

interface AnalyticsProps {
  refreshTrigger?: number; // Optional prop to trigger refresh when questions are asked
}

const Analytics: React.FC<AnalyticsProps> = ({ refreshTrigger }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getStats();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Refresh analytics when new questions are asked
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadAnalytics();
    }
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <button
            onClick={loadAnalytics}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">Error loading analytics: {error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Session Analytics</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={loadAnalytics}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {analytics.success ? (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.analytics.totalQuestions}
              </div>
              <div className="text-sm text-blue-800">Total Questions</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {(analytics.analytics.avgConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-800">Avg Confidence</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.recentActivity.length}
              </div>
              <div className="text-sm text-purple-800">Recent Queries</div>
            </div>
          </div>

          {/* Most Asked Questions */}
          {analytics.analytics.mostAskedQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Most Asked Questions</h3>
              <div className="space-y-2">
                {analytics.analytics.mostAskedQuestions.slice(0, 5).map((question, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity - Expanded View */}
          {isExpanded && analytics.recentActivity.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Questions</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.question}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(activity.confidence)}`}>
                        {(activity.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{activity.answerPreview}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.askedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Info */}
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-600">
              <strong>Source:</strong> {analytics.transcriptInfo.source}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {analytics.transcriptInfo.description}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {formatDate(analytics.generatedAt)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">
            {analytics.error || 'Analytics unavailable - database may not be connected'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;