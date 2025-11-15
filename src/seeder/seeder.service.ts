// src/seeder/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async seed() {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;
    const admin = await this.userModel.findOneAndUpdate(
      { email: adminEmail },
      {
        email: adminEmail,
        fullName: adminName,
        password: passwordHash,
        role: 'admin',
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
    console.log('✅ Seeding complete', admin);
  }
}
