import { Test, TestingModule } from '@nestjs/testing';
import { CampaignResolver } from './campaign.resolver';

describe('CampaignResolver', () => {
  let service: CampaignResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignResolver],
    }).compile();

    service = module.get<CampaignResolver>(CampaignResolver);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
