import { Body, Controller, Get, Post, UseGuards, Param, Delete } from '@nestjs/common';
import { CreateUserDTO, User } from 'src/shared/model/User';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';
import { UserService } from './user.service';
import { SameUserGuard } from '../../guards/same-user.guard';

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
  @UseGuards(new SameUserGuard())
  async createUser(@Body() user: CreateUserDTO): Promise<User> {
    const createdUser = await this.userService.create(user);

    return createdUser;
  }

  @Get('/:id')
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getUser(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);

    return user.toDTO();
  }

  @Delete('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
