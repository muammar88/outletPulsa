import { IsNumber, IsArray } from 'class-validator';

export class AssignPermissionDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
