import { ArrayUnique, IsArray, IsIn, IsString } from 'class-validator';

import { DOCUMENT_TYPE, type DocumentType } from 'src/_common/constants/signature.constant';
import { IsStringNotBlank } from 'src/_core/decorators/validation.decorator';

export class ManageReceiverSignaturesRequest {
  @IsStringNotBlank()
  documentId!: string;

  @IsIn(Object.values(DOCUMENT_TYPE))
  documentType!: DocumentType;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  targetUserIds!: string[];
}
