import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { FieldElement, v1alpha2 as starknet } from '@apibara/starknet';
import { validateAndParseAddress, hash, uint256 } from 'starknet';
import { ISharedIndexerService, SHARED_INDEXER_SERVICE } from 'src/shared-indexer/shared-indexer.interface';
import { IPrismaService, PRISMA_SERVICE } from 'src/prisma/prisma.interface';
import { ITokenGiverIndexerService, TOKEN_GIVER_INDEXER_SERVICE } from './token-giver-indexer.interface';
import constants from 'src/common/constants';

@Injectable()
export class TokenGiverIndexerService implements ITokenGiverIndexerService {
  private readonly logger = new Logger(TokenGiverIndexerService.name);
  private readonly eventKeys: string[];

  constructor(
    @Inject(SHARED_INDEXER_SERVICE)
    private readonly sharedIndexerService: ISharedIndexerService,

    @Inject(PRISMA_SERVICE)
    private readonly prismaService: IPrismaService,
  ) {
    this.eventKeys = [
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CREATE_CAMPAIGN),
      ),
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.DONATION_MADE),
      ),
      validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.WITHDRAWAL_MADE),
      ),
    ];
  }

  async onModuleInit() {
    this.sharedIndexerService.registerIndexer(
      this.eventKeys,
      this.handleEvents.bind(this),
    );
  }

  async handleEvents(event: starknet.IEvent) {
    try {
      this.logger.log('Received event');

      const eventKey = validateAndParseAddress(
        FieldElement.toHex(event.keys[0]),
      );

      switch (eventKey) {
        case validateAndParseAddress(
          hash.getSelectorFromName(constants.event_names.CREATE_CAMPAIGN),
        ):
          await this.handleCampaignCreatedEvent(event);
          break;
        case validateAndParseAddress(
          hash.getSelectorFromName(constants.event_names.DONATION_MADE),
        ):
          await this.handleDonationMadeEvent(event);
          break;
        case validateAndParseAddress(
          hash.getSelectorFromName(constants.event_names.WITHDRAWAL_MADE),
        ):
          await this.handleWithdrawalMadeEvent(event);
          break;
        case validateAndParseAddress(
          hash.getSelectorFromName(
            constants.event_names.DEPLOYED_TOKEN_GIVER_NFT,
          ),
        ):
          await this.handleDeployedTokenGiverNftEvent(event);
          break;
        default:
          this.logger.warn(`Unknown event type: ${eventKey}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing event: ${error.message}`,
        error.stack,
      );
      // Continue processing other events
    }
  }

  private async handleCampaignCreatedEvent(event: starknet.IEvent) {
    const [ownerFelt, campaignAddressFelt] = event.keys;
    const [
      tokenIdLow,
      tokenIdHigh,
      campaignIdLow,
      campaignIdHigh,
      nftTokenUriFelt,
      tokenGiverNftContractAddressFelt,
      blockTimestampFelt,
    ] = event.data;

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

    const campaignId = Number(
      uint256.uint256ToBN({
        low: FieldElement.toBigInt(campaignIdLow),
        high: FieldElement.toBigInt(campaignIdHigh),
      }),
    );

    const nftTokenUri = FieldElement.toBigInt(nftTokenUriFelt);

    const tokenGiverNftContractAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(tokenGiverNftContractAddressFelt).toString(16)}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const blockTimestamp = FieldElement.toBigInt(blockTimestampFelt);

    const campaign = await this.prismaService.campaign.findUnique({
      where: { campaign_id: campaignId },
    });

    if (!campaign) {
      this.logger.error(`Campaign not found for campaign_id: ${campaignId}`);
      return;
    }

    await this.prismaService.campaign.update({
      where: { campaign_id: campaignId },
      data: {
        campaign_owner: owner,
        campaign_address: campaignAddress,
        token_id: tokenId,
        nft_token_uri: nftTokenUri.toString(),
        token_giver_nft_contract_address: tokenGiverNftContractAddress,
      },
    });
  }

  private async handleDonationMadeEvent(event: starknet.IEvent) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [campaignAddressFelt, donorAddressFelt] = event.keys;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [amountLow, amountHigh, tokenIdLow, tokenIdHigh, blockTimestamp] =
      event.data;

    const campaignAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(campaignAddressFelt).toString(16)}`,
    );

    const amount = Number(
      uint256.uint256ToBN({
        low: FieldElement.toBigInt(amountLow),
        high: FieldElement.toBigInt(amountHigh),
      }),
    );

    const campaign = await this.prismaService.campaign.findUnique({
      where: { campaign_address: campaignAddress },
    });

    if (!campaign) {
      this.logger.error(
        `Campaign not found for campaign_address: ${campaignAddress}`,
      );
      return;
    }

    //updating the specific campaign's donation total
    await this.prismaService.campaign.update({
      where: { campaign_address: campaignAddress },
      data: {
        total_donations: {
          increment: Number(amount),
        },
        donations_count: {
          increment: 1,
        },
      },
    });
  }

  private async handleWithdrawalMadeEvent(event: starknet.IEvent) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [campaignAddressFelt, recipientAddressFelt] = event.keys;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [amountLow, amountHigh, blockTimestampFelt] = event.data;

    const campaignAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(campaignAddressFelt).toString(16)}`,
    );

    const amount = Number(
      uint256.uint256ToBN({
        low: FieldElement.toBigInt(amountLow),
        high: FieldElement.toBigInt(amountHigh),
      }),
    );

    const campaign = await this.prismaService.campaign.findUnique({
      where: { campaign_address: campaignAddress },
    });

    if (!campaign) {
      this.logger.error(
        `Campaign not found for campaign_address: ${campaignAddress}`,
      );
      return;
    }

    //updating the specific campaign's donation total
    await this.prismaService.campaign.update({
      where: { campaign_address: campaignAddress },
      data: {
        total_donations: {
          decrement: Number(amount),
        },
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleDeployedTokenGiverNftEvent(event: starknet.IEvent) {
    const [
      campaignIdLow,
      campaignIdHigh,
      tokenGiverNftContractAddressFelt,
      blockTimestampFelt,
    ] = event.data;

    const campaignId = Number(
      uint256.uint256ToBN({
        low: FieldElement.toBigInt(campaignIdLow),
        high: FieldElement.toBigInt(campaignIdHigh),
      }),
    );

    const tokenGiverNftContractAddress = validateAndParseAddress(
      `0x${FieldElement.toBigInt(tokenGiverNftContractAddressFelt).toString(16)}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const blockTimestamp = FieldElement.toBigInt(blockTimestampFelt);

    const campaign = await this.prismaService.campaign.findUnique({
      where: { campaign_id: campaignId },
    });

    if (!campaign) {
      this.logger.error(`Campaign not found for campaign_id: ${campaignId}`);
      return;
    }

    await this.prismaService.campaign.update({
      where: { campaign_id: campaignId },
      data: {
        token_giver_nft_contract_address: tokenGiverNftContractAddress,
      },
    });
  }
}
