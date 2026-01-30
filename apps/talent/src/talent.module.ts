import { Module } from '@nestjs/common';
import { TalentController } from './talent.controller';
import { TalentService } from './talent.service';
import { RequisitionsModule } from './requisitions/requisitions.module';

@Module({
  imports: [RequisitionsModule],
  controllers: [TalentController],
  providers: [TalentService],
})
export class TalentModule {}
