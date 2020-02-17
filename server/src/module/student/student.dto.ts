import { IStudentDTO, StudentStatus } from '../../shared/model/Student';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsEmail, IsOptional } from 'class-validator';

export class StudentDTO implements IStudentDTO {
  @IsNotEmpty()
  firstname!: string;

  @IsNotEmpty()
  lastname!: string;

  @IsNotEmpty()
  @IsEnum(StudentStatus)
  status!: StudentStatus;

  @IsNotEmpty()
  tutorial!: string;

  @ApiProperty({ type: String })
  courseOfStudies?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ type: String })
  matriculationNo?: string;

  @ApiProperty({ type: String })
  team?: string;

  constructor(fields: IStudentDTO) {
    Object.assign(this, fields);
  }
}
