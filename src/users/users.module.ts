import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import {
  Cart,
  CartItem,
  CartItemSchema,
  CartSchema,
} from 'src/schemas/cart.schema';
import { Promotion, PromotionSchema } from 'src/schemas/promotion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Promotion.name, schema: PromotionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
