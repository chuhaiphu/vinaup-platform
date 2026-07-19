import { IsStringNotBlank } from 'src/_core/decorators/validation.decorator';

export class UpdateSignatureUrlRequest {
  @IsStringNotBlank()
  url!: string;
}
