import { Module } from '@nestjs/common';
import { CampaignResolver } from './campaign.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CampaignResolver],
})
export class ResolversModule {}
