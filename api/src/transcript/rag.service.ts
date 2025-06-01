// api/src/transcript/rag.service.ts
import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RetrievalQAChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import type { TranscriptEntry } from './transcript.controller';

@Injectable()
export class RAGService {
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;
  private vectorStore: MemoryVectorStore | null = null;
  private qaChain: RetrievalQAChain | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize OpenAI components
    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small',
    });

    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 500,
    });
  }

  async initializeRAG(transcript: TranscriptEntry[]): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing LangChain RAG system...');

    try {
      // Step 1: Convert transcript to documents
      const documents = this.createDocuments(transcript);
      console.log(`📝 Created ${documents.length} documents from transcript`);

      // Step 2: Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const splitDocs = await textSplitter.splitDocuments(documents);
      console.log(`✂️ Split into ${splitDocs.length} chunks`);

      // Step 3: Create vector store from documents
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        this.embeddings
      );
      console.log('🎯 Created vector store with embeddings');

      // Step 4: Create custom prompt template
      const template = `You are an AI assistant analyzing a therapy session transcript between a therapist and a patient named Lucy. 
Use the following context to answer the question accurately and empathetically.

Context:
{context}

Question: {question}

Instructions:
- Answer based only on the provided context
- Be empathetic and professional when discussing mental health topics
- If the context doesn't contain enough information, say so clearly
- Quote relevant parts when appropriate
- Keep your answer concise but thorough

Answer:`;

      const promptTemplate = PromptTemplate.fromTemplate(template);

      // Step 5: Create retrieval QA chain
      this.qaChain = RetrievalQAChain.fromLLM(
        this.llm,
        this.vectorStore.asRetriever({
          k: 4, // Retrieve top 4 most relevant chunks
        }),
        {
          prompt: promptTemplate,
          returnSourceDocuments: true,
        }
      );

      this.isInitialized = true;
      console.log('✅ LangChain RAG system initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing RAG system:', error);
      throw error;
    }
  }

  private createDocuments(transcript: TranscriptEntry[]): Document[] {
    const documents: Document[] = [];

    // Strategy 1: Individual speaker turns
    transcript.forEach((entry, index) => {
      documents.push(new Document({
        pageContent: entry.text,
        metadata: {
          speaker: entry.speaker,
          index: index,
          type: 'speaker_turn',
          length: entry.text.length,
        },
      }));
    });

    // Strategy 2: Conversational context windows
    const windowSize = 3;
    for (let i = 0; i < transcript.length - windowSize + 1; i++) {
      const window = transcript.slice(i, i + windowSize);
      const combinedText = window
        .map(entry => `${entry.speaker}: ${entry.text}`)
        .join('\n\n');

      documents.push(new Document({
        pageContent: combinedText,
        metadata: {
          type: 'conversation_window',
          startIndex: i,
          endIndex: i + windowSize - 1,
          speakers: window.map(w => w.speaker),
          length: combinedText.length,
        },
      }));
    }

    return documents;
  }

  async answerQuestion(question: string): Promise<{
    answer: string;
    relevantQuotes: string[];
    confidence: number;
  }> {
    if (!this.isInitialized || !this.qaChain) {
      throw new Error('RAG system not initialized');
    }

    console.log(`❓ Processing question with LangChain: "${question}"`);

    try {
      // Use LangChain's RetrievalQA chain
      const result = await this.qaChain.invoke({
        query: question,
      });

      const answer = result.text || 'I was unable to generate an answer.';
      const sourceDocuments = result.sourceDocuments || [];

      // Extract relevant quotes from source documents
      const relevantQuotes = sourceDocuments
        .filter((doc: any) => doc.metadata.type === 'speaker_turn')
        .map((doc: any) => doc.pageContent)
        .slice(0, 3); // Limit to top 3 quotes

      // Calculate confidence based on retrieval scores
      const confidence = Math.min(0.7 + (sourceDocuments.length * 0.1), 1.0);

      console.log(`✅ Generated answer with ${sourceDocuments.length} source documents`);
      console.log(`📊 Confidence: ${(confidence * 100).toFixed(1)}%`);

      return {
        answer,
        relevantQuotes,
        confidence,
      };

    } catch (error) {
      console.error('❌ Error in LangChain QA chain:', error);
      throw error;
    }
  }

  async getSimilarDocuments(question: string, k: number = 5): Promise<any[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    const docs = await this.vectorStore.similaritySearch(question, k);
    return docs.map(doc => ({
      content: doc.pageContent.substring(0, 200) + '...',
      metadata: doc.metadata,
    }));
  }
}