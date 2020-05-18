import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ConnectionOptions } from 'mongoose';

export class DatabaseConfiguration {
  @IsString()
  readonly databaseURL!: string;

  @IsNumber()
  @Min(0)
  readonly maxRetries!: number;

  @IsOptional()
  @IsObject()
  readonly config?: Omit<ConnectionOptions, 'auth'>;
}
