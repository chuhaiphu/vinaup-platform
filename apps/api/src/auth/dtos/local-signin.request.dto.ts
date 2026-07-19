import { IsEmail } from 'class-validator';

import { IsStringNotBlank } from 'src/_core/decorators/validation.decorator';

export class LocalSignInRequest {
  @IsEmail()
  email!: string;

  @IsStringNotBlank()
  password!: string;
}
