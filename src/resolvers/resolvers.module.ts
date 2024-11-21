import { Module } from '@nestjs/common';
import { CampaignResolver } from './campaign.resolver';

@Module({
  providers: [CampaignResolver],
  exports: [CampaignResolver],
})
export class ResolversModule {}
