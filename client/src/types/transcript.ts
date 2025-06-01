// client/src/types/transcript.ts
// client/src/types/transcript.ts
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
  
export interface QAHistory {
    id: string;
    question: string;
    response: QuestionResponse;
    timestamp: Date;
}