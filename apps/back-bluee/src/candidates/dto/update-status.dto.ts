import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  APPLICATION_STATUSES,
  APPLICATION_SUB_STATUSES,
  REJECTION_REASON_CATEGORIES,
} from './application.enums';

class RejectionReasonDto {
  @IsIn(REJECTION_REASON_CATEGORIES)
  reasonCategory!: (typeof REJECTION_REASON_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  reasonText?: string;
}

export class UpdateStatusDto {
  @IsIn(APPLICATION_STATUSES)
  status!: (typeof APPLICATION_STATUSES)[number];

  @IsOptional()
  @IsIn(APPLICATION_SUB_STATUSES)
  subStatus?: (typeof APPLICATION_SUB_STATUSES)[number];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RejectionReasonDto)
  rejectionReason?: RejectionReasonDto;
}

export class RejectApplicationDto {
  @IsIn(REJECTION_REASON_CATEGORIES)
  reasonCategory!: (typeof REJECTION_REASON_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  reasonText?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class WithdrawApplicationDto {
  @IsOptional()
  @IsString()
  note?: string;
}
