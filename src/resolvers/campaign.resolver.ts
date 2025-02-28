import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { Campaign } from './models/campaign.model';
import { CampaignCreateInput } from './dtos/createCampaign.dto';
import { PaginatedCampaigns, PaginationInput } from './dtos/pagination.models';

@Resolver(() => Campaign)
export class CampaignResolver {
  private readonly logger = new Logger(CampaignResolver.name);

  constructor(private prismaService: PrismaService) {}

  @Mutation(() => Campaign)
  async createCampaign(
    @Args('campaignData') campaignData: CampaignCreateInput,
  ): Promise<Campaign> {
    try {
      return await this.prismaService.campaign.create({
        data: campaignData,
        include: { campaign_images: true, category: true },
      });
    } catch (error) {
      this.logger.error('Failed to create campaign', error.stack);
      throw new Error(
        'An error occurred while creating the campaign. Please try again later.',
      );
    }
  }

  @Query(() => [Campaign])
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const campaigns = await this.prismaService.campaign.findMany({
        include: { campaign_images: true, category: true },
        orderBy: {
          created_at: 'desc',
        },
      });
      return campaigns;
    } catch (error) {
      this.logger.error('Failed to retrieve campaigns', error.stack);
      throw new Error('Unable to retrieve campaigns. Please try again later.');
    }
  }

  @Query(() => Campaign, { nullable: true })
  async getCampaignById(
    @Args('campaignId', { type: () => Int }) campaignId: number,
  ): Promise<Campaign | null> {
    if (typeof campaignId !== 'number') {
      throw new BadRequestException('Invalid campaign ID format');
    }

    const campaign = await this.prismaService.campaign.findUnique({
      where: { campaign_id: campaignId },
      include: { campaign_images: true, category: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return campaign;
  }

  @Query(() => PaginatedCampaigns)
  async getCampaignsByCategory(
    @Args('name') name: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedCampaigns> {
    try {
      const { cursor, limit, skip } = pagination || {};

      // Fetch campaigns with pagination
      const campaigns = await this.prismaService.campaign.findMany({
        where: { category: { name } },
        include: { campaign_images: true, category: true },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: skip, 
        cursor: cursor ? { campaign_id: cursor } : undefined,
      });

      const totalCount = await this.prismaService.campaign.count({
        where: { category: { name } },
      });

      // Determine if there is a next page
      const hasNextPage = campaigns.length === limit;

      return {
        campaigns,
        totalCount,
        hasNextPage,
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve campaigns by category',
        error.stack,
      );
      throw new Error(
        'Unable to retrieve campaigns by category. Please try again later.',
      );
    }
  }
}
