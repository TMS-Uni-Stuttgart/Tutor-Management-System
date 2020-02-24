import { NewPasswordDTO } from '../../shared/model/User';
import { IsNotEmpty } from 'class-validator';

export class PasswordDTO implements NewPasswordDTO {
  @IsNotEmpty()
  password!: string;
}
