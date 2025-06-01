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

  static async getStats(): Promise<any> {
    try {
        console.log('🔄 Fetching analytics from:', `${API_BASE_URL}/transcript/stats`);
        const response = await fetch(`${API_BASE_URL}/transcript/stats`);
        console.log('📡 Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        throw error;
    }
  }

  static async getQAHistory(limit: number = 20): Promise<any[]> {
    try {
      console.log('🔄 Fetching Q&A history from:', `${API_BASE_URL}/transcript/history`);
      const response = await fetch(`${API_BASE_URL}/transcript/history?limit=${limit}`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Received Q&A history:', data.length, 'entries');
      return data;
    } catch (error) {
      console.error('❌ Error fetching Q&A history:', error);
      throw error;
    }
  }
}