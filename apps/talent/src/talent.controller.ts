import { Controller, Get } from '@nestjs/common';
import { TalentService } from './talent.service';

@Controller()
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get()
  getHello(): string {
    return this.talentService.getHello();
  }
}
