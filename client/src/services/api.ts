// client/src/services/api.ts
import type { TranscriptEntry, QuestionResponse } from '../types/transcript';

const API_BASE_URL = 'http://localhost:3000';

export class ApiService {
  static async getTranscript(): Promise<TranscriptEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transcript`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }
  }

  static async askQuestion(question: string): Promise<QuestionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/transcript/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  }
}