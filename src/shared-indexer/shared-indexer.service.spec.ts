import { Test, TestingModule } from '@nestjs/testing';
import { SharedIndexerService } from './shared-indexer.service';
import 'src/common/env';

jest.mock('src/common/env', () => ({
  env: {
    app: {
      port: 3000,
      env: 'test',
      isProduction: false,
      isDevelopment: false,
    },
    indexer: {
      network: 'sepolia',
      dnaToken: '23456789123',
      rpcUrl:
        'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/',
      dnaClientUrl: 'dns:///sepolia.starknet.a5a.ch',
      starknetRpc:
        'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/',
    }
  },
}));

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
