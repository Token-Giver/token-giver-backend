import { Test, TestingModule } from '@nestjs/testing';
import { SharedIndexerService } from './shared-indexer.service';

describe('SharedIndexerService', () => {
  let service: SharedIndexerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedIndexerService],
    }).compile();

    service = module.get<SharedIndexerService>(SharedIndexerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
