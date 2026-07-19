import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class ManageMembersAssignedRequest {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  organizationMemberIds!: string[];
}
