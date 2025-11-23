import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

import { AddCartDto, UpdateProfileDto } from './dto/update-profile.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { Order, OrderDocument } from 'src/schemas/order.schema';
import { PaginationQueryDto } from 'src/config/dto/pagination';
import { Promotion, PromotionDocument } from 'src/schemas/promotion.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return data;
  }

  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  // Find a user by ID
  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Update user information
  async update(userId: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // Get all users (for admin)
  async findAll(): Promise<User[]> {
    return this.userModel.find().sort({ createdAt: 'desc' }).exec();
  }

  async createFromGoogle(googleUser: any): Promise<UserDocument> {
    // Map fields from the Google user to your user schema.
    const createdUser = new this.userModel({
      email: googleUser.email,
      fullName: `${googleUser.firstName} ${googleUser.lastName}`,
      confirmed: true,
      provider: 'google',
      role: 'user',
      providerId: googleUser.providerId,
      passwordHash: '',
    });
    return createdUser.save();
  }

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async findProducts(query: PaginationQueryDto) {
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

  async findProduct(id: string) {
    return this.productModel.findById(id);
  }

  async addToCart(userId: string, dto: AddCartDto) {
    console.log('🚀 ~ UsersService ~ addToCart ~ userId:', userId);
    let cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }
    const updateResult = await this.cartModel.updateOne(
      { _id: cart._id, 'items.productId': new Types.ObjectId(dto.productId) },
      { $inc: { 'items.$.quantity': dto.quantity } },
    );
    if (updateResult.matchedCount === 0) {
      await this.cartModel.updateOne(
        { _id: cart._id },
        {
          $push: {
            items: {
              productId: new Types.ObjectId(dto.productId),
              quantity: dto.quantity,
            },
          },
        },
      );
    }

    return this.cartModel.findById(cart._id).populate('items.productId');
  }

  async getCart(userId: string) {
    return this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId');
  }

  async updateCart(userId: string, productId: string, quantity: number) {
    const productObjectId = new Types.ObjectId(productId);

    // Try to update the quantity atomically
    const result = await this.cartModel.updateOne(
      {
        userId: new Types.ObjectId(userId),
        'items.productId': productObjectId,
      },
      { $set: { 'items.$.quantity': quantity } },
    );

    if (result.matchedCount === 0) {
      throw new BadRequestException('Product not in cart');
    }
    // Return updated cart
    return this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId');
  }

  async removeCart(userId: string, productId: string) {
    const productObjectId = new Types.ObjectId(productId);

    const result = await this.cartModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $pull: { items: { productId: productObjectId } } },
    );

    if (result.modifiedCount === 0) {
      throw new BadRequestException('Product not in cart');
    }

    // Return updated cart
    return this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId');
  }

  // async createOrder(
  //   userId: string,
  //   dto: { cartId: string; promotionCode?: string },
  // ) {
  //   const cart = await this.cartModel
  //     .findById(dto.cartId)
  //     .populate('items.productId');
  //   if (!cart) throw new BadRequestException('Cart not found');

  //   let subtotal = 0;
  //   const items = cart.items.map((i) => {
  //     const product = i.productId as any; // populated product
  //     const total = product.price * i.quantity;
  //     subtotal += total;
  //     return {
  //       productId: product._id,
  //       name: product.name,
  //       quantity: i.quantity,
  //       price: product.price,
  //       total,
  //     };
  //   });

  //   const discountAmount = dto.promotionCode ? subtotal * 0.1 : 0; // example: 10% discount
  //   const total = subtotal - discountAmount;

  //   const order = await this.orderModel.create({
  //     userId: new Types.ObjectId(userId),
  //     items,
  //     subtotal,
  //     discountAmount,
  //     total,
  //     status: 'pending',
  //     promotionCode: dto.promotionCode || null,
  //   });

  //   // Remove cart atomically
  //   await this.cartModel.findByIdAndDelete(dto.cartId);

  //   return this.orderModel.findById(order._id).populate('items.productId');
  // }

  async createOrder(
    userId: string,
    dto: { cartId: string; promotionCode?: string },
  ) {
    const cart = await this.cartModel
      .findById(dto.cartId)
      .populate('items.productId');
    if (!cart) throw new BadRequestException('Cart not found');

    let subtotal = 0;
    const items = cart.items.map((i) => {
      const product = i.productId as any; // populated product
      const total = product.price * i.quantity;
      subtotal += total;
      return {
        productId: product._id,
        name: product.name,
        quantity: i.quantity,
        price: product.price,
        total,
      };
    });

    let discountAmount = 0;
    let promotionId: Types.ObjectId | null = null;

    if (dto.promotionCode) {
      const promotion = await this.promotionModel.findOne({
        code: dto.promotionCode,
        active: true,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
        quantity: { $gt: 0 },
      });
      if (!promotion) {
        throw new BadRequestException('Promotion not valid or already used');
      }

      // Calculate discount
      if (promotion.discountType === 'percent') {
        discountAmount = (subtotal * promotion.discountValue) / 100;
      } else {
        discountAmount = promotion.discountValue;
      }

      promotion.quantity = promotion.quantity - 1;
      if (promotion.quantity <= 0) {
        promotion.active = false;
      }
      await promotion.save();

      promotionId = new Types.ObjectId(`${promotion._id}`);
    }

    const total = subtotal - discountAmount;

    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items,
      subtotal,
      discountAmount,
      total,
      status: 'pending',
      promotionId,
    });

    // Remove cart atomically
    await this.cartModel.findByIdAndDelete(dto.cartId);

    return this.orderModel.findById(order._id).populate('items.productId');
  }

  async getOrders(userId: string, query: any) {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (query.status) filter.status = query.status;

    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('items.productId');
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderModel
      .findOne({
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId),
      })
      .populate('items.productId');
    if (!order) throw new BadRequestException('Order not found');
    return order;
  }

  async getOrderStatus(userId: string, orderId: string) {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });
    if (!order) throw new BadRequestException('Order not found');
    return { orderId: order._id, status: order.status };
  }

  async getPromotions() {
    return this.promotionModel
      .find({
        active: true,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
        quantity: { $gt: 0 },
      })
      .sort({ createdAt: -1 });
  }
}
