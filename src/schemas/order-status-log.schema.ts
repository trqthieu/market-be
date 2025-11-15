import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderStatusLogDocument = OrderStatusLog & Document;

@Schema({ timestamps: true })
export class OrderStatusLog {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true })
  oldStatus: string;

  @Prop({ required: true })
  newStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  updatedBy: Types.ObjectId;
}

export const OrderStatusLogSchema =
  SchemaFactory.createForClass(OrderStatusLog);
