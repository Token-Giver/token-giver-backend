import { Inject, Injectable, Logger } from '@nestjs/common';
import { FieldElement, v1alpha2 as starknet } from '@apibara/starknet';
import { validateAndParseAddress, hash, uint256 } from 'starknet';
import { SharedIndexerService } from 'src/shared-indexer/shared-indexer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import constants from 'src/common/constants';

@Injectable()
export class TokenGiverIndexerService {
  private readonly logger = new Logger(TokenGiverIndexerService.name);
  private readonly eventKeys: string[];

  constructor(
    @Inject(SharedIndexerService)
    private readonly sharedIndexerService: SharedIndexerService,

    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
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
  private async handleCampaignCreatedEvent(event: starknet.IEvent) {
    const [ownerFelt, campaignAddressFelt] = event.keys;
    const [tokenIdLow, tokenIdHigh, tokenGiverNftContractAddressFelt] =
      event.data;

    const owner = validateAndParseAddress(
      `0x${FieldElement.toBigInt(ownerFelt).toString(16)}`,
    );

    const campaignAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(campaignAddressFelt).toString(16)}`,
    );

    const tokenId = Number(
      uint256.uint256ToBN({
        low: FieldElement.toBigInt(tokenIdLow),
        high: FieldElement.toBigInt(tokenIdHigh),
      }),
    );

    const tokenGiverNftContractAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(tokenGiverNftContractAddressFelt).toString(16)}`,
    );

    await this.prismaService.campaign.create({
      data: {
        token_id: tokenId,
        campaign_address: campaignAddress,
        campaign_owner: owner,
        token_giver_nft_contract_address: tokenGiverNftContractAddress,
        createdAt: new Date(), // Ensure you track creation time
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleCampaignUpdatedEvent(event: starknet.IEvent) {
    const [ownerFelt, campaignAddressFelt] = event.keys;

    const [tokenIdLow, tokenIdtHigh, tokenGiverNftContractAddressFelt] =
      event.data;

    const owner = validateAndParseAddress(
      `0x${FieldElement.toBigInt(ownerFelt).toString(16)}`,
    );

    const campaignAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(campaignAddressFelt).toString(16)}`,
    );

    const tokenId = Number(
      uint256.uint256ToBN({
        low: FieldElement.toBigInt(tokenIdLow),
        high: FieldElement.toBigInt(tokenIdtHigh),
      }),
    );

    const tokenGiverNftContractAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(tokenGiverNftContractAddressFelt).toString(16)}`,
    );

    const campaign = await this.prismaService.campaign.findFirst({
      where: { token_id: tokenId },
    });

    if (!campaign) {
      this.logger.warn(`Campaign with token Id ${tokenId} doesn't exist`);
    }

    await this.prismaService.campaign.update({
      where: { id: campaign.id },
      data: {
        campaign_address: campaignAddress,
        campaign_owner: owner,
        token_giver_nft_contract_address: tokenGiverNftContractAddress,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleDonationReceivedEvent(event: starknet.IEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleCampaignDeletedEvent(event: starknet.IEvent) {}
}
