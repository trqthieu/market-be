import { Controller, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';
import { ChatDto } from './chat.dto';

@Controller('ai')
export class AIController {
  constructor(private ai: AIService) {}

  @Post('chat')
  async chat(@Body() chatDto: ChatDto) {
    return { reply: await this.ai.chat(chatDto.message) };
  }

  //   @Post('index')
  //   async index() {
  //     return await this.ai.indexAll();
  //   }
}
