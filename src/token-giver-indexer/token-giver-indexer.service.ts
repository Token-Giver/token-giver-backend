import { Inject, Injectable, Logger } from '@nestjs/common';
import { FieldElement, v1alpha2 as starknet } from '@apibara/starknet';
import { validateAndParseAddress } from 'starknet';
import { SharedIndexerService } from 'src/shared-indexer/shared-indexer.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PrismaService } from 'src/prisma/prisma.service';
import constants from 'src/common/constants';

@Injectable()
export class TokenGiverIndexerService {
  private readonly logger = new Logger(TokenGiverIndexerService.name);
  private readonly eventKeys: string[];

  constructor(
    @Inject(SharedIndexerService)
    private readonly sharedIndexerService: SharedIndexerService,
  ) {
    this.eventKeys = [
      validateAndParseAddress(constants.events_key.CAMPAIGN_CREATED),
      validateAndParseAddress(constants.events_key.CAMPAIGN_UPDATED),
      validateAndParseAddress(constants.events_key.DONATION_RECEIVED),
      validateAndParseAddress(constants.events_key.CAMPAIGN_DELETED),
    ];
  }

  async onModuleInit() {
    this.sharedIndexerService.registerIndexer(
      this.eventKeys,
      this.handleEvents.bind(this),
    );
  }

  private async handleEvents(event: starknet.IEvent) {
    this.logger.log('Received event');

    const eventKey = validateAndParseAddress(FieldElement.toHex(event.keys[0]));

    switch (eventKey) {
      case validateAndParseAddress(constants.events_key.CAMPAIGN_CREATED):
        this.handleCampaignCreatedEvent(event);
        break;
      case validateAndParseAddress(constants.events_key.CAMPAIGN_UPDATED):
        this.handleCampaignUpdatedEvent(event);
        break;
      case validateAndParseAddress(constants.events_key.DONATION_RECEIVED):
        this.handleDonationReceivedEvent(event);
        break;
      case validateAndParseAddress(constants.events_key.CAMPAIGN_DELETED):
        this.handleCampaignDeletedEvent(event);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventKey}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleCampaignCreatedEvent(event: starknet.IEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleCampaignUpdatedEvent(event: starknet.IEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleDonationReceivedEvent(event: starknet.IEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleCampaignDeletedEvent(event: starknet.IEvent) {}
}
