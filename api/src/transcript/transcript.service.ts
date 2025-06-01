// api/src/transcript/transcript.service.ts
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TranscriptEntry, QuestionResponse } from './transcript.controller';
import { RAGService } from './rag.service';
import { SimpleDbService } from 'src/db/db';

@Injectable()
export class TranscriptService {
  private transcript: TranscriptEntry[] = [];

  constructor(public readonly ragService: RAGService,
    private readonly dbService: SimpleDbService
  ) {
    console.log('🚀 TranscriptService constructor called - loading transcript...');
    this.loadTranscript();
    console.log('📋 TranscriptService initialization complete');
  }

  private async loadTranscript(): Promise<void> {
    try {
      const filePath = join(process.cwd(), 'data', 'transcript.txt');
      const content = readFileSync(filePath, 'utf-8');
      this.transcript = this.parseTranscript(content);
      await this.ragService.initializeRAG(this.transcript);
    } catch (error) {
      console.error('Error loading transcript:', error);
      this.transcript = [];
    }
  }

  private parseTranscript(content: string): TranscriptEntry[] {
    console.log('🔍 Parsing transcript content, length:', content.length);
    
    const entries: TranscriptEntry[] = [];
    
    // Split by lines and process each line
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if this line contains a speaker tag
      const speakerMatch = line.match(/\[Speaker:(\d+)\]\s*(.*)/);
      
      if (speakerMatch) {
        const speakerNum = speakerMatch[1];
        const speaker = speakerNum === '0' ? 'Therapist' : 'Lucy';
        const text = speakerMatch[2].trim();
        
        // Only add entries with actual text content
        if (text) {
          entries.push({
            speaker,
            text
          });
          
          console.log(`✅ Added entry #${entries.length}: [${speaker}] ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        }
      }
    }

    console.log(`🎯 Successfully parsed ${entries.length} total entries`);
    
    // Log first few entries for debugging
    entries.slice(0, 3).forEach((entry, index) => {
      console.log(`Entry ${index + 1}: [${entry.speaker}] ${entry.text.substring(0, 100)}...`);
    });
    
    return entries;
  }


  getTranscript(): TranscriptEntry[] {
    return this.transcript;
  }

  async answerQuestion(question: string): Promise<QuestionResponse> {
    const startTime = Date.now() // Track processing time

    try {
      console.log(`🤔 Received question: "${question}"`);

      // Use LangChain RAG to answer the question
      const ragResult = await this.ragService.answerQuestion(question);

      const response: QuestionResponse = {
        question,
        answer: ragResult.answer,
        relevantQuotes: ragResult.relevantQuotes,
        confidence: ragResult.confidence,
      };

      const processingTime = Date.now() - startTime;

      // Save to database
      try{
        await this.dbService.saveQA(
            question,
            ragResult.answer,
            ragResult.relevantQuotes,
            ragResult.confidence
        );
        console.log(`💾 Saved Q&A to database in ${processingTime}ms`);
      } catch (dbError) {
        console.warn('⚠️ Could not save to database (continuing normally):', dbError.message);
      }
      console.log(`✅ Generated response with ${ragResult.relevantQuotes.length} quotes and ${(ragResult.confidence * 100).toFixed(1)}% confidence`);

      return response;
    } catch (error) {
      console.error('❌ Error answering question:', error);
      
      // Fallback response
      return {
        question,
        answer: `I apologize, but I encountered an error while processing your question: "${question}". Please make sure you have set up your OpenAI API key and try again. Error: ${error.message}`,
        relevantQuotes: [],
        confidence: 0,
      };
    }
  }

  // Get Q&A statistics (gracefully handles database unavailability)
  async getQAStats() {
    try {
      return await this.dbService.getQAStats();
    } catch (error) {
      console.warn('⚠️ Could not fetch Q&A stats:', error.message);
      return {
        totalQuestions: 0,
        avgConfidence: 0,
        topQuestions: []
      };
    }
  }

  // Get recent Q&A history (gracefully handles database unavailability)
  async getRecentQAs(limit: number = 20) {
    try {
      return await this.dbService.getRecentQAs(limit);
    } catch (error) {
      console.warn('⚠️ Could not fetch recent Q&As:', error.message);
      return [];
    }
  }
}