// client/src/App.tsx
import React, { useEffect, useState } from 'react';
import TranscriptDisplay from './components/TranscriptDisplay';
import QuestionForm from './components/QuestionForm';
import QAHistoryComponent from './components/QAHistory';
import Analytics from './components/Analytics';
import { ApiService } from './services/api';
import type { TranscriptEntry, QAHistory } from './types/transcript';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(true);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [analyticsRefreshTrigger, setAnalyticsRefreshTrigger] = useState(0);

  useEffect(() => {
    loadTranscript();
    loadQAHistory();
  }, []);

  const loadTranscript = async () => {
    try {
      setTranscriptLoading(true);
      setTranscriptError(null);
      const data = await ApiService.getTranscript();
      setTranscript(data);
    } catch (error) {
      setTranscriptError(error instanceof Error ? error.message : 'Failed to load transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  const loadQAHistory = async () => {
    try {
      setHistoryLoading(true);
      const historyData = await ApiService.getQAHistory(20);
      setQaHistory(historyData);
      console.log('✅ Loaded', historyData.length, 'Q&A history entries from database');
    } catch (error) {
      console.warn('⚠️ Could not load Q&A history:', error);
      setQaHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    try {
      setQuestionLoading(true);
      const response = await ApiService.askQuestion(question);
      
      const newEntry: QAHistory = {
        id: Date.now().toString(),
        question,
        response,
        timestamp: new Date()
      };
      // Add to the beginning of the history
      setQaHistory(prev => [newEntry, ...prev]);
      // Trigger analytics refresh
      setAnalyticsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting question:', error);
      const errorEntry: QAHistory = {
        id: Date.now().toString(),
        question,
        response: {
          question,
          answer: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
          relevantQuotes: [],
          confidence: 0,
        },
        timestamp: new Date()
      };
      setQaHistory(prev => [errorEntry, ...prev]);
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            AI Transcript Analysis
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Ask questions about the therapy session transcript
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Transcript Display */}
          <div className="xl:col-span-1">
            <TranscriptDisplay
              transcript={transcript}
              loading={transcriptLoading}
              error={transcriptError}
            />
          </div>

          {/* Middle Column - Question Form and History */}
          <div className="xl:col-span-1 space-y-6">
            <QuestionForm
              onSubmit={handleQuestionSubmit}
              loading={questionLoading}
            />
            
            <QAHistoryComponent history={qaHistory} />
          </div>

          {/* Right Column - Analytics */}
          <div className="xl:col-span-1">
            <Analytics refreshTrigger={analyticsRefreshTrigger} />
          </div>

        </div>

        {/* Retry button for transcript loading errors */}
        {transcriptError && (
          <div className="text-center mt-6">
            <button
              onClick={loadTranscript}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry Loading
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
