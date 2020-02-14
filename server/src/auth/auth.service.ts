import bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../module/user/user.service';
import { UserCredentials } from './auth.model';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(username: string, password: string): Promise<UserCredentials> {
    try {
      const user: UserCredentials = await this.userService.findWithUsername(username);
      const isCorrectPassword = await bcrypt.compare(password, user.password);

      if (isCorrectPassword) {
        return user;
      } else {
        throw new UnauthorizedException();
      }
    } catch {
      throw new UnauthorizedException();
    }
  }
}
