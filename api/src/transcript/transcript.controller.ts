import { Controller, Get, Post, Body, Query} from '@nestjs/common';
import { TranscriptService } from './transcript.service';

export class AskQuestionDto {
  question: string;
}

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface QuestionResponse {
  question: string;
  answer: string;
  relevantQuotes: string[];
  confidence: number;
}

@Controller('transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Get()
  async getTranscript(): Promise<TranscriptEntry[]> {
    console.log('🎯 GET /transcript endpoint hit');
    const transcript = this.transcriptService.getTranscript();
    // return this.transcriptService.getTranscript();
    console.log('📋 Returning transcript with', transcript.length, 'entries');
    console.log('📄 First entry:', transcript[0]);
    return transcript;
  }

  @Post('debug-retrieval')
  async debugRetrieval(@Body() body: { question: string }): Promise<any> {
    console.log('🐛 Debug retrieval for question:', body.question);
    try {
      const docs = await this.transcriptService.ragService.getSimilarDocuments(body.question, 5);
      return {
        question: body.question,
        retrievedDocuments: docs,
      };
    } catch (error) {
      return {
        error: error.message,
        question: body.question,
      };
    }
  }

  @Post('question')
  async askQuestion(@Body() askQuestionDto: AskQuestionDto): Promise<QuestionResponse> {
    console.log('❓ Question received:', askQuestionDto.question);
    return this.transcriptService.answerQuestion(askQuestionDto.question);
  }

  @Get('stats')
  async getAnalytics(): Promise<any> {
    console.log('📊 GET /transcript/stats - Fetching therapy session Q&A analytics');
    try {
      const stats = await this.transcriptService.getQAStats();
      const recentQAs = await this.transcriptService.getRecentQAs(10);
      console.log(stats)
      
      return {
        success: true,
        transcriptInfo: {
          source: 'Therapy session transcript (static)',
          description: 'Questions and answers about the provided therapy session between Therapist and Lucy'
        },
        analytics: {
          totalQuestions: stats.totalQuestions,
          avgConfidence: Math.round(stats.avgConfidence * 100) / 100,
          mostAskedQuestions: stats.topQuestions
        },
        recentActivity: recentQAs.map(qa => ({
          question: qa.question,
          confidence: Math.round(qa.confidence * 100) / 100,
          askedAt: qa.created_at,
          answerPreview: qa.answer.substring(0, 100) + (qa.answer.length > 100 ? '...' : '')
        })),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error fetching therapy session analytics:', error);
      return {
        success: false,
        transcriptInfo: {
          source: 'Therapy session transcript (static)',
          description: 'Questions and answers about the provided therapy session between Therapist and Lucy'
        },
        analytics: { 
          totalQuestions: 0, 
          avgConfidence: 0, 
          mostAskedQuestions: [] 
        },
        recentActivity: [],
        error: 'Analytics unavailable - database may not be connected',
        generatedAt: new Date().toISOString()
      };
    }
  }

  @Get('history')
  async getQAHistory(@Query('limit') limit?: string): Promise<any> {
    console.log('📚 GET /transcript/history endpoint hit');
    const limitNum = limit ? parseInt(limit) : 20;
    
    try {
      const history = await this.transcriptService.getRecentQAs(limitNum);
      console.log(`📋 Returning ${history.length} Q&A history entries`);
      
      // Convert database format to frontend format
      const formattedHistory = history.map(qa => ({
        id: qa.id,
        question: qa.question,
        response: {
          question: qa.question,
          answer: qa.answer,
          relevantQuotes: Array.isArray(qa.relevant_quotes) ? qa.relevant_quotes : JSON.parse(qa.relevant_quotes || '[]'),
          confidence: qa.confidence,
        },
        timestamp: new Date(qa.created_at)
      }));
      
      return formattedHistory;
    } catch (error) {
      console.error('❌ Error fetching Q&A history:', error);
      return [];
    }
  }
}