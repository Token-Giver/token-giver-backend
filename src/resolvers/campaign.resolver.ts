import { Resolver, Query } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { Campaign } from './models/campaign.model';
import { Logger } from '@nestjs/common';

@Resolver(() => Campaign)
export class CampaignResolver {
  private readonly logger = new Logger(CampaignResolver.name);

  constructor(private prismaService: PrismaService) {}

  @Query(() => [Campaign], { 
    name: 'getAllCampaigns', 
    nullable: 'items' 
  })
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const campaigns = await this.prismaService.campaign.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return campaigns;
    } catch (error) {
      this.logger.error('Failed to retrieve campaigns', error.stack);
      throw new Error('Unable to retrieve campaigns. Please try again later.');
    }
  }
}