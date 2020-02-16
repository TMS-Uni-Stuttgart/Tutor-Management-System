import { Controller, Post, UseGuards, Req, Get, Res } from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('/login')
  @UseGuards(LoginGuard)
  login(@Req() req: Request & { user?: any }) {
    // TODO: Return correct user data.

    return req.user;
  }

  @Get('/logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout();
    res.clearCookie('connect.sid').send('Successfully logged out.');
  }
}
