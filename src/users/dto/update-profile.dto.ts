// src/users/dto/update-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // avatar?: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // address?: string;

  // Add other fields (e.g. phone, avatar) as needed
}

export class AddCartDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  promotionCode?: string;
}

export class CartItemDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;
}

export class UpdateCartDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
