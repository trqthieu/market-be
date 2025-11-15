// FILE: src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Promotion, PromotionSchema } from '../schemas/promotion.schema';
import { Order, OrderSchema } from '../schemas/order.schema';

import { ProductController } from './product/product.controller';
import { AdminUserController } from './user/admin-user.controller';
import { PromotionController } from './promotion/promotion.controller';
import { AdminOrderController } from './order/admin-order.controller';
import { ProductService } from './product/product.service';
import { AdminUserService } from './user/admin-user.service';
import { PromotionService } from './promotion/promotion.service';
import { AdminOrderService } from './order/admin-order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [
    ProductController,
    AdminUserController,
    PromotionController,
    AdminOrderController,
  ],
  providers: [
    ProductService,
    AdminUserService,
    PromotionService,
    AdminOrderService,
  ],
})
export class AdminModule {}
