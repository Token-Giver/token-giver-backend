import { Module } from '@nestjs/common';
import { CampaignResolver } from './campaign.resolver';
import { CategoryResolver } from './category.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CampaignResolver, CategoryResolver],
})
export class ResolversModule {}
