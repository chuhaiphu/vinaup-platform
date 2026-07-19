import { IsStringNotBlank } from 'src/_core/decorators/validation.decorator';

export class UpdateAuthSecretRequest {
  @IsStringNotBlank()
  secret!: string;

  @IsStringNotBlank()
  provider!: string;
}
