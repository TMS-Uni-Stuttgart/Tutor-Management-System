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
import { NamedElement } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { IUser } from 'shared/model/User';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { SameUserGuard } from '../../guards/same-user.guard';
import { CreateUserDTO, PasswordDTO, UserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async getAllUsers(): Promise<IUser[]> {
        const users = await this.userService.findAll();

        return users.map((user) => user.toDTO());
    }

    @Post()
    @UseGuards(SameUserGuard)
    @UsePipes(ValidationPipe)
    async createUser(@Body() user: CreateUserDTO): Promise<IUser> {
        return await this.userService.create(user);
    }

    @Post('/generate')
    @UseGuards(HasRoleGuard)
    @UsePipes(ValidationPipe)
    async createManyUsers(@Body() users: CreateUserDTO[]): Promise<IUser[]> {
        return await this.userService.createMany(users);
    }

    @Get('/name/tutor')
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TUTOR)
    async getNamesOfAllTutors(): Promise<NamedElement[]> {
        return await this.userService.getNamesOfAllTutors();
    }

    @Get('/:id')
    @UseGuards(SameUserGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async getUser(@Param('id') id: string): Promise<IUser> {
        const user = await this.userService.findById(id);

        return user.toDTO();
    }

    @Patch('/:id')
    @UseGuards(SameUserGuard)
    @UsePipes(ValidationPipe)
    async updateUser(@Param('id') id: string, @Body() dto: UserDTO): Promise<IUser> {
        return await this.userService.update(id, dto);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(HasRoleGuard)
    async deleteUser(@Param('id') id: string): Promise<void> {
        await this.userService.delete(id);
    }

    @Post('/:id/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(SameUserGuard)
    @UsePipes(ValidationPipe)
    async updatePassword(@Param('id') id: string, @Body() body: PasswordDTO): Promise<void> {
        await this.userService.setPassword(id, body.password);
    }

    @Post('/:id/temporaryPassword')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(HasRoleGuard)
    @UsePipes(ValidationPipe)
    async updateTemporaryPassword(
        @Param('id') id: string,
        @Body() body: PasswordDTO
    ): Promise<void> {
        await this.userService.setTemporaryPassword(id, body.password);
    }
}
