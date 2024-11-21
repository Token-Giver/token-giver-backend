import { Resolver, Query, Args } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { Campaign } from './models/campaign.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Resolver(() => Campaign)
export class CampaignResolver {
  constructor(private prismaService: PrismaService) {}

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
