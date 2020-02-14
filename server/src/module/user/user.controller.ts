import { Body, Controller, Get, Post } from '@nestjs/common';
import { User, UserDTO, CreateUserDTO } from 'src/shared/model/User';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.findAll();

    return users;
  }

  @Post()
  async createUser(@Body() user: CreateUserDTO): Promise<User> {
    const createdUser = await this.userService.create(user);

    return createdUser;
  }
}
