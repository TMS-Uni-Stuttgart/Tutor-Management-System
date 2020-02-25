import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/shared/model/User';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { SameUserGuard } from '../../guards/same-user.guard';
import { Role } from '../../shared/model/Role';
import { PasswordDTO, CreateUserDTO, UserDTO } from './user.dto';
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
  @UseGuards(new SameUserGuard())
  @UsePipes(ValidationPipe)
  async createUser(@Body() user: CreateUserDTO): Promise<User> {
    const createdUser = await this.userService.create(user);

    return createdUser;
  }

  @Get('/:id')
  @UseGuards(new SameUserGuard({ roles: [Role.ADMIN, Role.EMPLOYEE] }))
  async getUser(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);

    return user.toDTO();
  }

  @Patch('/:id')
  @UseGuards(new SameUserGuard())
  @UsePipes(ValidationPipe)
  async updateUser(@Param('id') id: string, @Body() dto: UserDTO): Promise<User> {
    const updatedUser = await this.userService.update(id, dto);

    return updatedUser;
  }

  @Delete('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  @Post('/:id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updatePassword(@Param('id') id: string, @Body() body: PasswordDTO) {
    await this.userService.setPassword(id, body.password);
  }

  @Post('/:id/temporaryPassword')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updateTemporaryPassword(@Param('id') id: string, @Body() body: PasswordDTO) {
    await this.userService.setTemporaryPassword(id, body.password);
  }
}
