// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AddCartDto,
  CreateOrderDto,
  UpdateCartDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get user profile
  @Get('profile')
  async getProfile(@Req() req) {
    console.log(req.user);

    return this.usersService.getProfile(req.user._id);
  }

  // Update user profile
  @Put('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user._id, updateProfileDto);
  }

  @Get('products')
  findProducts(@Query() query) {
    return this.usersService.findProducts(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  findProduct(@Param('id') id: string) {
    return this.usersService.findProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart')
  addToCart(@Req() req, @Body() dto: AddCartDto) {
    return this.usersService.addToCart(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cart')
  getCart(@Req() req) {
    return this.usersService.getCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cart')
  updateCart(@Req() req, @Body() body: UpdateCartDto) {
    return this.usersService.updateCart(
      req.user.id,
      body.productId,
      body.quantity,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart/:productId')
  removeCart(@Req() req, @Param('productId') productId: string) {
    return this.usersService.removeCart(req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    return this.usersService.createOrder(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  getOrders(@Req() req, @Query() query) {
    return this.usersService.getOrders(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(@Req() req, @Param('id') id: string) {
    return this.usersService.getOrder(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/status')
  getOrderStatus(@Req() req, @Param('id') id: string) {
    return this.usersService.getOrderStatus(req.user.id, id);
  }

  @Get('promotions')
  getPromotions(@Req() req) {
    return this.usersService.getPromotions();
  }
}
