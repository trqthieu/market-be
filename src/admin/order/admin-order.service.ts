import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { PaginationQueryDto } from 'src/config/dto/pagination';

@Injectable()
export class AdminOrderService {
  constructor(@InjectModel(Order.name) private model: Model<OrderDocument>) {}

  async findAll(query: PaginationQueryDto) {
    const page = +query?.page || 1;
    const limit = +query?.limit || 10;
    const skip = (page - 1) * limit;
    // const searchQuery = query.search
    //   ? { userId: { $regex: query.search, $options: 'i' } }
    //   : {};
    const searchQuery = {};

    const [data, total] = await Promise.all([
      this.model
        .find(searchQuery)
        .sort({ createdAt: 'desc' })
        .skip(skip)
        .limit(limit)
        .populate('userId')
        .populate('promotionId')
        .populate('items.productId')
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
    const o = await this.model
      .findById(id)
      .populate('userId')
      .populate('items.productId')
      .populate('promotionId')
      .exec();
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  async updateStatus(id: string, status: string) {
    const o = await this.model
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }
}
