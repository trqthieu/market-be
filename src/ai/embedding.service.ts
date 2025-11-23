import { Injectable } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
  private model: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  }

  async generateEmbedding(text: string) {
    const res = await this.model.embedContent(text);
    return res.embedding.values;
  }
}
