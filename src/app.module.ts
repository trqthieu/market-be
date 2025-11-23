import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { UploadModule } from './uploads/upload.module';
import { SeederModule } from './seeder/seeder.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AIModule } from './ai/ai.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    UploadModule,
    SeederModule,
    AdminModule,
    UsersModule,
    AuthModule,
    AIModule
  ],
})
export class AppModule {}
