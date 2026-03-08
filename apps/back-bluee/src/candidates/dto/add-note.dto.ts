import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { NOTE_VISIBILITIES } from './application.enums';

export class AddNoteDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsIn(NOTE_VISIBILITIES)
  visibility!: (typeof NOTE_VISIBILITIES)[number];
}
