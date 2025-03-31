import { Test, TestingModule } from '@nestjs/testing';
import { CampaignResolver } from './campaign.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignCreateInput } from './dtos/createCampaign.dto';
import { Campaign } from './models/campaign.model';

describe('CampaignResolver', () => {
  let resolver: CampaignResolver;
  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignResolver,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<CampaignResolver>(CampaignResolver);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createCampaign', () => {
    it('should successfully create a campaign', async () => {
      const campaignData: CampaignCreateInput = {
        campaign_id: 1,
        campaign_name: 'Test Campaign',
        campaign_description: 'Test Description',
        cover_photo: 'test.jpg',
        target_amount: 1000,
        organizer: '0x123',
        beneficiary: '0x456',
        campaign_images: ['image1.jpg', 'image2.jpg'],
        category_id: 1,
        location: 'Test Location',
      };

      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const expectedCampaign: Partial<Campaign> = {
        ...campaignData,
        created_at: new Date(),
        updated_at: new Date(),
        category: mockCategory,
        token_id: null,
        campaign_address: null,
        campaign_owner: null,
        nft_token_uri: null,
        token_giver_nft_contract_address: null,
        total_donations: null,
        social_links: null,
      };

      prismaService.campaign.create.mockResolvedValue(
        expectedCampaign as Campaign,
      );

      const result = await resolver.createCampaign(campaignData);

      expect(result).toEqual(expectedCampaign);
      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: campaignData,
        include: { category: true },
      });
    });

    it('should handle database errors when creating campaign', async () => {
      const campaignData: CampaignCreateInput = {
        campaign_id: 1,
        campaign_name: 'Test Campaign',
        campaign_description: 'Test Description',
        cover_photo: 'test.jpg',
        target_amount: 1000,
        organizer: '0x123',
        beneficiary: '0x456',
        campaign_images: ['image1.jpg', 'image2.jpg'],
        category_id: 1,
        location: 'Test Location',
      };

      prismaService.campaign.create.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.createCampaign(campaignData)).rejects.toThrow(
        'An error occurred while creating the campaign. Please try again later.',
      );
    });
  });

  describe('getAllCampaigns', () => {
    it('should return campaigns with default pagination', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCampaigns: Partial<Campaign>[] = [
        {
          campaign_id: 1,
          campaign_name: 'Campaign 1',
          campaign_description: 'Description 1',
          cover_photo: 'photo1.jpg',
          target_amount: 1000,
          organizer: '0x123',
          beneficiary: '0x456',
          campaign_images: ['image1.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 1',
        },
        {
          campaign_id: 2,
          campaign_name: 'Campaign 2',
          campaign_description: 'Description 2',
          cover_photo: 'photo2.jpg',
          target_amount: 2000,
          organizer: '0x789',
          beneficiary: '0xabc',
          campaign_images: ['image2.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 2',
        },
      ];

      prismaService.campaign.findMany.mockResolvedValue(
        mockCampaigns as Campaign[],
      );

      const result = await resolver.getAllCampaigns();

      expect(result.items).toEqual(mockCampaigns);
      expect(result.hasNextPage).toBe(false);
      expect(result.endCursor).toBe('2');
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        cursor: undefined,
        include: { category: true },
        orderBy: { campaign_id: 'desc' },
      });
    });

    it('should return campaigns with custom pagination and cursor', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCampaigns: Partial<Campaign>[] = [
        {
          campaign_id: 2,
          campaign_name: 'Campaign 2',
          campaign_description: 'Description 2',
          cover_photo: 'photo2.jpg',
          target_amount: 2000,
          organizer: '0x789',
          beneficiary: '0xabc',
          campaign_images: ['image2.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 2',
        },
        {
          campaign_id: 3,
          campaign_name: 'Campaign 3',
          campaign_description: 'Description 3',
          cover_photo: 'photo3.jpg',
          target_amount: 3000,
          organizer: '0xdef',
          beneficiary: '0xghi',
          campaign_images: ['image3.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 3',
        },
      ];

      prismaService.campaign.findMany.mockResolvedValue(
        mockCampaigns as Campaign[],
      );

      const result = await resolver.getAllCampaigns('1', 5);

      expect(result.items).toEqual(mockCampaigns);
      expect(result.hasNextPage).toBe(false);
      expect(result.endCursor).toBe('3');
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        take: 6,
        skip: 1,
        cursor: { campaign_id: 1 },
        include: { category: true },
        orderBy: { campaign_id: 'desc' },
      });
    });

    it('should handle database errors when fetching campaigns', async () => {
      prismaService.campaign.findMany.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.getAllCampaigns()).rejects.toThrow(
        'Unable to retrieve campaigns. Please try again later.',
      );
    });
  });

  describe('getCampaignById', () => {
    it('should return a campaign when found', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCampaign: Partial<Campaign> = {
        campaign_id: 1,
        campaign_name: 'Test Campaign',
        campaign_description: 'Test Description',
        cover_photo: 'test.jpg',
        target_amount: 1000,
        organizer: '0x123',
        beneficiary: '0x456',
        campaign_images: ['image1.jpg'],
        category: mockCategory,
        category_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        token_id: null,
        campaign_address: null,
        campaign_owner: null,
        nft_token_uri: null,
        token_giver_nft_contract_address: null,
        total_donations: null,
        social_links: null,
        location: 'Test Location',
      };

      prismaService.campaign.findUnique.mockResolvedValue(
        mockCampaign as Campaign,
      );

      const result = await resolver.getCampaignById(1);

      expect(result).toEqual(mockCampaign);
      expect(prismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { campaign_id: 1 },
        include: { category: true },
      });
    });

    it('should throw NotFoundException when campaign not found', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(resolver.getCampaignById(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(resolver.getCampaignById('invalid' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle database errors when fetching campaign', async () => {
      prismaService.campaign.findUnique.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.getCampaignById(1)).rejects.toThrow(
        'Unable to retrieve campaigns. Please try again later.',
      );
    });
  });

  describe('getCampaignsByCategory', () => {
    it('should return campaigns for a specific category with default pagination', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCampaigns: Partial<Campaign>[] = [
        {
          campaign_id: 1,
          campaign_name: 'Campaign 1',
          campaign_description: 'Description 1',
          cover_photo: 'photo1.jpg',
          target_amount: 1000,
          organizer: '0x123',
          beneficiary: '0x456',
          campaign_images: ['image1.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 1',
        },
        {
          campaign_id: 2,
          campaign_name: 'Campaign 2',
          campaign_description: 'Description 2',
          cover_photo: 'photo2.jpg',
          target_amount: 2000,
          organizer: '0x789',
          beneficiary: '0xabc',
          campaign_images: ['image2.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 2',
        },
      ];

      prismaService.campaign.findMany.mockResolvedValue(
        mockCampaigns as Campaign[],
      );

      const result = await resolver.getCampaignsByCategory('Test Category');

      expect(result.items).toEqual(mockCampaigns);
      expect(result.hasNextPage).toBe(false);
      expect(result.endCursor).toBe('2');
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        cursor: undefined,
        where: { category: { name: 'Test Category' } },
        include: { category: true },
        orderBy: { campaign_id: 'desc' },
      });
    });

    it('should return campaigns for a specific category with custom pagination', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCampaigns: Partial<Campaign>[] = [
        {
          campaign_id: 2,
          campaign_name: 'Campaign 2',
          campaign_description: 'Description 2',
          cover_photo: 'photo2.jpg',
          target_amount: 2000,
          organizer: '0x789',
          beneficiary: '0xabc',
          campaign_images: ['image2.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 2',
        },
        {
          campaign_id: 3,
          campaign_name: 'Campaign 3',
          campaign_description: 'Description 3',
          cover_photo: 'photo3.jpg',
          target_amount: 3000,
          organizer: '0xdef',
          beneficiary: '0xghi',
          campaign_images: ['image3.jpg'],
          category: mockCategory,
          category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          token_id: null,
          campaign_address: null,
          campaign_owner: null,
          nft_token_uri: null,
          token_giver_nft_contract_address: null,
          total_donations: null,
          social_links: null,
          location: 'Test Location 3',
        },
      ];

      prismaService.campaign.findMany.mockResolvedValue(
        mockCampaigns as Campaign[],
      );

      const result = await resolver.getCampaignsByCategory(
        'Test Category',
        '1',
        5,
      );

      expect(result.items).toEqual(mockCampaigns);
      expect(result.hasNextPage).toBe(false);
      expect(result.endCursor).toBe('3');
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        take: 6,
        skip: 1,
        cursor: { campaign_id: 1 },
        where: { category: { name: 'Test Category' } },
        include: { category: true },
        orderBy: { campaign_id: 'desc' },
      });
    });

    it('should handle database errors when fetching campaigns by category', async () => {
      prismaService.campaign.findMany.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        resolver.getCampaignsByCategory('Test Category'),
      ).rejects.toThrow(
        'Unable to retrieve campaigns by category. Please try again later.',
      );
    });
  });
});
