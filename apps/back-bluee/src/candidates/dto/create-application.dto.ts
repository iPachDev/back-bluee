import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsMongoId()
  requisitionId!: string;

  @IsMongoId()
  candidateId!: string;

  @IsOptional()
  @IsMongoId()
  recruiterId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
