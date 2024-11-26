import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SharedIndexerService } from './shared-indexer/shared-indexer.service';
import { Campaign } from './resolvers/models/campaign.model';
import { num, hash } from 'starknet';

@Injectable()
export class handleDonationReceivedService {
  private readonly logger = new Logger(handleDonationReceivedService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedIndexerService: SharedIndexerService,
  ) {}

  onModuleInit() {
    const donationEventKey = num.toHex(hash.starknetKeccak('DonationCreated'));

    this.sharedIndexerService.registerIndexer(
      [donationEventKey],
      this.handleDonationReceivedEvent.bind(this),
    );
  }

  private async handleDonationReceivedEvent(
    event: any,
  ): Promise<Campaign | null> {
    try {
      // Extract donation details from the event
      const [campaign_id, amount] = event.data;

      this.logger.log(
        `Processing DonationReceived event for campaign ${campaign_id}`,
      );

      //updating the specific campaign's donation total
      const campaign = await this.prismaService.campaign.update({
        where: { id: Number(campaign_id) },
        data: {
          totalDonations: {
            increment: Number(amount),
          },
        },
      });

      this.logger.log(
        `Donation of ${amount} successfully updated for campaign ${campaign_id}.`,
      );

      return campaign;
    } catch (error) {
      this.logger.error(
        `Error processing DonationReceived event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
