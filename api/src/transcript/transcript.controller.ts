import { Controller, Get, Post, Body } from '@nestjs/common';
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
}