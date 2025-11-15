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

  @Prop()
  startAt: Date;

  @Prop()
  endAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  usedBy: Types.ObjectId;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
