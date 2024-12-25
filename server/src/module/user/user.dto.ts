import { ICreateUserDTO, INewPasswordDTO, IUserDTO } from 'shared/model/User';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'shared/model/Role';

export class PasswordDTO implements INewPasswordDTO {
    @IsNotEmpty()
    password!: string;
}

export class UserDTO implements IUserDTO {
    @IsString()
    firstname!: string;

    @IsString()
    lastname!: string;

    @IsArray()
    @IsString({ each: true })
    tutorials!: string[];

    @IsArray()
    @IsString({ each: true })
    tutorialsToCorrect!: string[];

    @IsArray()
    @IsEnum(Role, { each: true })
    roles!: Role[];

    @IsEmail()
    email!: string;

    @IsString()
    username!: string;
}

export class CreateUserDTO extends UserDTO implements ICreateUserDTO {
    @IsString()
    password!: string;
}
