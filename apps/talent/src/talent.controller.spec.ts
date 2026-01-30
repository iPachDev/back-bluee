import { Test, TestingModule } from '@nestjs/testing';
import { TalentController } from './talent.controller';
import { TalentService } from './talent.service';

describe('TalentController', () => {
  let talentController: TalentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TalentController],
      providers: [TalentService],
    }).compile();

    talentController = app.get<TalentController>(TalentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(talentController.getHello()).toBe('Hello World!');
    });
  });
});
