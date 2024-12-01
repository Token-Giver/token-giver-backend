import { Inject, Injectable, Logger } from '@nestjs/common';
import { FieldElement, v1alpha2 as starknet } from '@apibara/starknet';
import { validateAndParseAddress, hash } from 'starknet';
import { SharedIndexerService } from 'src/shared-indexer/shared-indexer.service';
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
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CAMPAIGN_CREATED),
      ),
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CAMPAIGN_UPDATED),
      ),
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.DONATION_RECEIVED),
      ),
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CAMPAIGN_DELETED),
      ),
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
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CAMPAIGN_CREATED),
      ):
        this.handleCampaignCreatedEvent(event);
        break;
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CAMPAIGN_UPDATED),
      ):
        this.handleCampaignUpdatedEvent(event);
        break;
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.DONATION_RECEIVED),
      ):
        this.handleDonationReceivedEvent(event);
        break;
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CAMPAIGN_DELETED),
      ):
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
