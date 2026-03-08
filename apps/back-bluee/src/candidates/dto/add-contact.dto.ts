import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CONTACT_CHANNELS, CONTACT_OUTCOMES } from './application.enums';

export class AddContactDto {
  @IsIn(CONTACT_CHANNELS)
  channel!: (typeof CONTACT_CHANNELS)[number];

  @IsString()
  @IsNotEmpty()
  to!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsIn(CONTACT_OUTCOMES)
  outcome!: (typeof CONTACT_OUTCOMES)[number];
}
