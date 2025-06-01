// client/src/components/QuestionForm.tsx
import React, { useState } from 'react';

interface QuestionFormProps {
  onSubmit: (question: string) => void;
  loading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const suggestedQuestions = [
    "What is Lucy studying?",
    "How long has Lucy been feeling down?",
    "Who does Lucy live with?",
    "Why doesn't Lucy talk to her friends?",
    "When did Lucy first see her GP?"
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Ask a Question</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to know about the transcript?
          </label>
          <textarea
            id="question"
            rows={3}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Ask Question'
          )}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions:</h3>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((suggested, index) => (
            <button
              key={index}
              onClick={() => setQuestion(suggested)}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {suggested}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;