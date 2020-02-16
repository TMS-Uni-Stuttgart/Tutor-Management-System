import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Post('/login')
  @UseGuards(LoginGuard)
  login(@Req() req: Request & { user?: any }) {
    // TODO: Return correct user data.

    return req.user;
  }
}
