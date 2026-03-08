import { IsIn, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { APPLICATION_STATUSES } from './application.enums';

export class QueryApplicationsDto {
  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsMongoId()
  jobId?: string;

  @IsOptional()
  @IsIn(APPLICATION_STATUSES)
  status?: (typeof APPLICATION_STATUSES)[number];

  @IsOptional()
  @IsMongoId()
  recruiterId?: string;

  @IsOptional()
  @IsMongoId()
  candidateId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
