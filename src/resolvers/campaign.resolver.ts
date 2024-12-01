import { Resolver, Query, Args } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { Campaign } from './models/campaign.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Resolver(() => Campaign)
export class CampaignResolver {
  private readonly logger = new Logger(CampaignResolver.name);

  constructor(private prismaService: PrismaService) {}

  @Query(() => [Campaign], {
    name: 'getAllCampaigns',
    nullable: 'items',
  })
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const campaigns = await this.prismaService.campaign.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return campaigns;
    } catch (error) {
      this.logger.error('Failed to retrieve campaigns', error.stack);
      throw new Error('Unable to retrieve campaigns. Please try again later.');
    }
  }

  @Query(() => Campaign, { nullable: true })
  async getCampaignById(@Args('id') id: number): Promise<Campaign | null> {
    // Validate ID format (assuming UUID format)
    //TODO: difine other ways to validate the id.
    if (typeof id !== 'number') {
      throw new BadRequestException('Invalid campaign ID format');
    }

    // Fetch campaign from database
    const campaign = await this.prismaService.campaign.findUnique({
      where: { id },
    });

    // Handle non-existent campaign
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }
}
