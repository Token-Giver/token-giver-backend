import { Test, TestingModule } from '@nestjs/testing';
import { TokenGiverIndexerService } from './token-giver-indexer.service';
import { PrismaService } from '../prisma/prisma.service';
import { SharedIndexerService } from '../shared-indexer/shared-indexer.service';
import { v1alpha2 as starknet, FieldElement } from '@apibara/starknet';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { validateAndParseAddress } from 'starknet';
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

function parseFelt(felt: unknown): string {
  return validateAndParseAddress(
    `0x${FieldElement.toBigInt(felt).toString(16)}`,
  );
}

describe('TokenGiverIndexerService', () => {
  let service: TokenGiverIndexerService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let module: TestingModule;
  let sharedIndexerService: jest.Mocked<SharedIndexerService>;

  // Mock valid event data
  const mockValidEvent = {
    keys: [
      FieldElement.fromBigInt(BigInt('0x1234')), // owner
      FieldElement.fromBigInt(BigInt('0x5678')), // campaign address
    ],
    data: [
      FieldElement.fromBigInt(BigInt('1')), // tokenIdLow
      FieldElement.fromBigInt(BigInt('0')), // tokenIdHigh
      FieldElement.fromBigInt(BigInt('0x9abc')), // tokenGiverNftContractAddress
    ],
  } as starknet.IEvent;

  beforeEach(async () => {
    const prismaServiceMock = mockDeep<PrismaClient>();
    const sharedIndexerServiceMock = { registerIndexer: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        TokenGiverIndexerService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: SharedIndexerService,
          useValue: sharedIndexerServiceMock,
        },
      ],
    }).compile();

    service = module.get<TokenGiverIndexerService>(TokenGiverIndexerService);
    prismaService = module.get(PrismaService);
    sharedIndexerService = module.get(SharedIndexerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCampaignCreatedEvent', () => {
    it('should successfully process a valid campaign created event', async () => {
      const expectedDate = new Date();
      jest.useFakeTimers().setSystemTime(expectedDate);

      await service['handleCampaignCreatedEvent'](mockValidEvent);

      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          token_id: 1,
          campaign_address: parseFelt(mockValidEvent.keys[1]),
          campaign_owner: parseFelt(mockValidEvent.keys[0]),
          token_giver_nft_contract_address: parseFelt(mockValidEvent.data[2]),
          createdAt: expectedDate,
        },
      });
    });

    it('should handle Prisma errors gracefully', async () => {
      prismaService.campaign.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service['handleCampaignCreatedEvent'](mockValidEvent),
      ).rejects.toThrow('Database error');
    });

    it('should handle invalid field element values', async () => {
      const invalidEvent = {
        keys: [
          null, // Invalid owner
          FieldElement.fromBigInt(BigInt('0x5678')),
        ],
        data: mockValidEvent.data,
      } as unknown as starknet.IEvent;

      await expect(
        service['handleCampaignCreatedEvent'](invalidEvent),
      ).rejects.toThrow();
    });

    it('should handle missing event data', async () => {
      const incompleteEvent = {
        keys: [FieldElement.fromBigInt(BigInt('0x1234'))],
        data: [],
      } as starknet.IEvent;

      await expect(
        service['handleCampaignCreatedEvent'](incompleteEvent),
      ).rejects.toThrow();
    });

    it('should correctly parse uint256 token ID', async () => {
      const eventWithLargeTokenId = {
        ...mockValidEvent,
        data: [
          FieldElement.fromBigInt(BigInt('1000')), // tokenIdLow
          FieldElement.fromBigInt(BigInt('1')), // tokenIdHigh
          mockValidEvent.data[2],
        ],
      };

      await service['handleCampaignCreatedEvent'](eventWithLargeTokenId);

      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token_id: expect.any(Number),
        }),
      });
    });
  });

  describe('onModuleInit', () => {
    it('should register event handlers with correct event keys', async () => {
      await service.onModuleInit();

      expect(sharedIndexerService.registerIndexer).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(String),
          expect.any(String),
        ]),
        expect.any(Function)
      );
    });
  });
});