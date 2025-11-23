import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true, unique: true })
  code: string; // e.g. WELCOME10

  @Prop({ enum: ['percent', 'fixed'], required: true })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 0 })
  quantity: number;

  @Prop()
  startAt: Date;

  @Prop()
  endAt: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
