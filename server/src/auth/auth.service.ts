import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserService } from '../module/user/user.service';
import { UserCredentials, UserCredentialsWithPassword } from './auth.model';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    async validateUser(username: string, password: string): Promise<UserCredentials> {
        try {
            const {
                password: savedPassword,
                ...user
            }: UserCredentialsWithPassword = await this.userService.findWithUsername(username);
            const isCorrectPassword = await bcrypt.compare(password, savedPassword);

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
