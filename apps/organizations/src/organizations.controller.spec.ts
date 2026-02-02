import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsController', () => {
  let organizationsController: OrganizationsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [OrganizationsService],
    }).compile();

    organizationsController = app.get<OrganizationsController>(OrganizationsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(organizationsController.getHello()).toBe('Hello World!');
    });
  });
});
