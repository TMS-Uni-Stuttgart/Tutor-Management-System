import { Controller, Post, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';

@Controller('auth')
export class AuthController {
  @Post('/login')
  @UseGuards(LoginGuard)
  login() {
    return { auth: 'works' };
  }
}
