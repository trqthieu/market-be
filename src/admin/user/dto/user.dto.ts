import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['user', 'admin'], required: false })
  @IsEnum(['user', 'admin'], {
    message: 'Status must be one of: user, admin',
  })
  @IsOptional()
  role?: 'user' | 'admin';
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({ enum: ['user', 'admin'], required: false })
  @IsEnum(['user', 'admin'], {
    message: 'Status must be one of: user, admin',
  })
  @IsOptional()
  role?: 'user' | 'admin';
}
