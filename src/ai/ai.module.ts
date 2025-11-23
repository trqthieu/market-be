import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { EmbeddingService } from './embedding.service';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AIController],
  providers: [AIService, EmbeddingService],
})
export class AIModule {}
