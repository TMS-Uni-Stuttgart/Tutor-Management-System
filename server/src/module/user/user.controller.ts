import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDTO, User } from 'src/shared/model/User';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.findAll();

    return users;
  }

  @Post()
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async createUser(@Body() user: CreateUserDTO): Promise<User> {
    const createdUser = await this.userService.create(user);

    return createdUser;
  }
}
