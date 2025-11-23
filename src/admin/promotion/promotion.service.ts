import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from 'src/schemas/promotion.schema';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { PaginationQueryDto } from 'src/config/dto/pagination';

@Injectable()
export class PromotionService {
  constructor(
    @InjectModel(Promotion.name) private model: Model<PromotionDocument>,
  ) {}

  async create(dto: CreatePromotionDto) {
    const existing = await this.model.findOne({ code: dto.code }).exec();
    if (existing) throw new ConflictException('Promotion code exists');
    const created = new this.model(dto);
    return created.save();
  }

  async findAll(query: PaginationQueryDto) {
    const page = +query?.page || 1;
    const limit = +query?.limit || 10;
    const skip = (page - 1) * limit;
    const searchQuery = query.search
      ? { code: { $regex: query.search, $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      this.model
        .find(searchQuery)
        .sort({ createdAt: 'desc' })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(searchQuery),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const p = await this.model.findById(id).exec();
    if (!p) throw new NotFoundException('Promotion not found');
    return p;
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const p = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!p) throw new NotFoundException('Promotion not found');
    return p;
  }

  async delete(id: string) {
    const p = await this.model.findByIdAndDelete(id).exec();
    if (!p) throw new NotFoundException('Promotion not found');
    return { deleted: true };
  }
}
