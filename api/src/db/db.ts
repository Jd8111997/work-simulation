// api/src/db/db.ts
import { Injectable } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

interface Database {
  users: {
    id: number;
    name: string;
    email: string;
  };
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export interface QARecord {
  id: string;
  question: string;
  answer: string;
  relevant_quotes: string[];
  confidence: number;
  created_at: Date;
}

@Injectable()
export class SimpleDbService {
  private pool: Pool;

  constructor() {
    console.log(process.env.DB_PASSWORD)
    this.pool = new Pool({
      host:  'db',
      port: parseInt( '5432'),
      database:  'appdb',
      user: 'postgres',
      password:  'postgres',
    });

    this.initializeTable();
    console.log('📊 Simple database service initialized');
  }

  private async initializeTable(): Promise<void> {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS qa_history (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          relevant_quotes JSONB DEFAULT '[]',
          confidence DECIMAL(3,2) DEFAULT 0.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_qa_history_created_at ON qa_history(created_at);
      `;
      
      await this.pool.query(createTableQuery);
      console.log('✅ QA History table ready');
    } catch (error) {
      console.error('❌ Error initializing database table:', error);
    }
  }

  async saveQA(
    question: string,
    answer: string,
    relevantQuotes: string[],
    confidence: number
  ): Promise<QARecord> {
    const query = `
      INSERT INTO qa_history (question, answer, relevant_quotes, confidence)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [question, answer, JSON.stringify(relevantQuotes), confidence];
    const result = await this.pool.query(query, values);
    
    console.log(`💾 Saved Q&A record: "${question.substring(0, 50)}..."`);
    return result.rows[0];
  }

  async getRecentQAs(limit: number = 50): Promise<QARecord[]> {
    const query = `
      SELECT * FROM qa_history 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }

  async getQAStats(): Promise<{
    totalQuestions: number;
    avgConfidence: number;
    topQuestions: string[];
  }> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_questions,
        AVG(confidence) as avg_confidence
      FROM qa_history
    `;
    
    const topQuestionsQuery = `
      SELECT question, COUNT(*) as frequency
      FROM qa_history
      GROUP BY question
      ORDER BY frequency DESC
      LIMIT 5
    `;
    
    const [statsResult, topQuestionsResult] = await Promise.all([
      this.pool.query(statsQuery),
      this.pool.query(topQuestionsQuery)
    ]);
    
    return {
      totalQuestions: parseInt(statsResult.rows[0].total_questions) || 0,
      avgConfidence: parseFloat(statsResult.rows[0].avg_confidence) || 0,
      topQuestions: topQuestionsResult.rows.map(row => row.question)
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}