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
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';
import { IShortTest } from '../../shared/model/ShortTest';
import { ShortTestDTO } from '../scheinexam/scheinexam.dto';
import { ShortTestService } from './short-test.service';

@Controller('short-test')
export class ShortTestController {
    constructor(private readonly shortTestService: ShortTestService) {}

    @Get()
    @UseGuards(AuthenticatedGuard)
    async getAllShortTests(): Promise<IShortTest[]> {
        const tests = await this.shortTestService.findAll();
        return tests.map((test) => test.toDTO());
    }

    @Post()
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    @UsePipes(ValidationPipe)
    async createShortTest(@Body() dto: ShortTestDTO): Promise<IShortTest> {
        return await this.shortTestService.create(dto);
    }

    @Get('/:id')
    @UseGuards(AuthenticatedGuard)
    async getSheet(@Param('id') id: string): Promise<IShortTest> {
        const shortTest = await this.shortTestService.findById(id);
        return shortTest.toDTO();
    }

    @Patch('/:id')
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    @UsePipes(ValidationPipe)
    async updateShortTest(@Param('id') id: string, @Body() dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = await this.shortTestService.update(id, dto);
        return shortTest;
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async deleteSheet(@Param('id') id: string): Promise<void> {
        await this.shortTestService.delete(id);
    }
}
