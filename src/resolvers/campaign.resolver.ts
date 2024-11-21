import { Resolver } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { Campaign } from './models/campaign.model';

@Resolver(() => Campaign)
export class CampaignResolver {
  constructor(private prismaService: PrismaService) {}
}
