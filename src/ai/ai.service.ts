import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { ProductService } from 'src/admin/product/product.service';

@Injectable()
export class AIService {
  private chatModel: GenerativeModel;

  constructor(
    private productService: ProductService,
    private embeddingService: EmbeddingService,
  ) {
    this.chatModel = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY,
    ).getGenerativeModel({
      model: 'gemini-2.5-pro',
    });
  }

  cosine(a: number[], b: number[]) {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (normA * normB);
  }

  async chat(message: string) {
    const qEmbed = await this.embeddingService.generateEmbedding(message);

    const products = await this.productService.listWithEmbedding();

    const scored = products
      .map((p) => ({ ...p, score: this.cosine(qEmbed, p.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3

    const context = scored
      .map(
        (p) => `
Tên: ${p.name}
Giá: ${p.price}
Mô tả: ${p.description}
Danh mục: ${p.category}
      `,
      )
      .join('\n');

    const prompt = `
Bạn là trợ lý bán hàng của ứng dụng Chợ Nhà Mình.
Chỉ trả lời dựa trên dữ liệu trong CONTEXT.

CONTEXT:
${context}

Câu hỏi:
${message}
    `;

    const result = await this.chatModel.generateContent(prompt);
    return result.response.text();
  }
}
