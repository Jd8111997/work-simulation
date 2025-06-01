// api/src/transcript/transcript.module.ts
import { Module } from '@nestjs/common';
import { TranscriptController } from './transcript.controller';
import { TranscriptService } from './transcript.service';
import { RAGService } from './rag.service';
import { SimpleDbService } from 'src/db/db';

@Module({
  controllers: [TranscriptController],
  providers: [SimpleDbService, RAGService, TranscriptService],
  exports: [TranscriptService, RAGService, SimpleDbService]
})
export class TranscriptModule {}