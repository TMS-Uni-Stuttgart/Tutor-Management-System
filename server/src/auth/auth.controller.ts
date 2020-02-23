import { Controller, Post, UseGuards, Req, Get, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('/login')
  @HttpCode(HttpStatus.OK)
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
