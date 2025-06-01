// api/src/transcript/transcript.module.ts
import { Module } from '@nestjs/common';
import { TranscriptController } from './transcript.controller';
import { TranscriptService } from './transcript.service';
import { RAGService } from './rag.service';

@Module({
  controllers: [TranscriptController],
  providers: [RAGService, TranscriptService],
  exports: [TranscriptService, RAGService]
})
export class TranscriptModule {}