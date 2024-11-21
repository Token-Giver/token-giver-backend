import { Test, TestingModule } from '@nestjs/testing';
import { TokenGiverIndexerService } from './token-giver-indexer.service';

describe('TokenGiverIndexerService', () => {
  let service: TokenGiverIndexerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenGiverIndexerService],
    }).compile();

    service = module.get<TokenGiverIndexerService>(TokenGiverIndexerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
