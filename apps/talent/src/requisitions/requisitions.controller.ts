import { Controller } from '@nestjs/common';
import { RequisitionsService } from './requisitions.service';

@Controller()
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}
}
