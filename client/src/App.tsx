// client/src/App.tsx
import React, { useEffect, useState } from 'react';
import TranscriptDisplay from './components/TranscriptDisplay';
import QuestionForm from './components/QuestionForm';
import QAHistoryComponent from './components/QAHistory';
import { ApiService } from './services/api';
import type { TranscriptEntry, QAHistory } from './types/transcript';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(true);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAHistory[]>([]);

  useEffect(() => {
    loadTranscript();
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
      
      setQaHistory(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error submitting question:', error);
      // You could add error handling UI here
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Transcript Display */}
          <div className="space-y-6">
            <TranscriptDisplay
              transcript={transcript}
              loading={transcriptLoading}
              error={transcriptError}
            />
          </div>

          {/* Right Column - Question Form and History */}
          <div className="space-y-6">
            <QuestionForm
              onSubmit={handleQuestionSubmit}
              loading={questionLoading}
            />
            
            <QAHistoryComponent history={qaHistory} />
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
