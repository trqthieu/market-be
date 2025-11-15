// auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from 'src/users/dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: NestJwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Local sign up: Create a new user and return a JWT
  async signUp(signUpDto: SignUpDto) {
    const existedUser = await this.usersService.findByEmail(signUpDto.email);
    console.log("🚀 ~ AuthService ~ signUp ~ existedUser:", existedUser)
    if (existedUser) {
      throw new BadRequestException('User existed');
    }
    const password = await bcrypt.hash(signUpDto.password, 10);
    console.log("🚀 ~ AuthService ~ signUp ~ password:", password)
    const user = await this.usersService.create({ ...signUpDto, password });
    console.log("🚀 ~ AuthService ~ signUp ~ user:", user)
    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return { user, accessToken: token };
  }

  // Local login: Validate credentials and return JWT
  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
    return { user, accessToken: token };
  }

  // Google OAuth: Find or create user based on Google profile and return JWT
  async oAuthLogin(googleUser: any) {
    console.log(googleUser);

    let user = await this.usersService.findByEmail(googleUser.email);
    if (!user) {
      user = await this.usersService.createFromGoogle(googleUser);
    }
    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return { user, accessToken: token };
  }

  async getProfile(user: any): Promise<any> {
    const res = await this.usersService.findById(user._id);
    return res;
  }

  async updateProfile(user: any, updateData: UpdateProfileDto): Promise<any> {
    const updated = await this.usersService.updateProfile(user._id, updateData);
    return updated;
  }
}
