import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationQueryDto } from 'src/config/dto/pagination';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    const created = new this.productModel(dto);
    return created.save();
  }

  async findAll(query: PaginationQueryDto) {
    const page = +query?.page || 1;
    const limit = +query?.limit || 10;
    const skip = (page - 1) * limit;
    const searchQuery = query.search
      ? { name: { $regex: query.search, $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      this.productModel
        .find(searchQuery)
        .sort({ createdAt: 'desc' })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(searchQuery),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const p = await this.productModel.findById(id).exec();
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(id: string, dto: UpdateProductDto) {
    const p = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async delete(id: string) {
    const p = await this.productModel.findByIdAndDelete(id).exec();
    if (!p) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
