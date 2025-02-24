import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => SharedIndexerService))
    private readonly sharedIndexerService: SharedIndexerService,

    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
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

  private async handleEvents(event: starknet.IEvent) {
    this.logger.log('Received event');

    const eventKey = validateAndParseAddress(FieldElement.toHex(event.keys[0]));

    switch (eventKey) {
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.CREATE_CAMPAIGN),
      ):
        this.handleCampaignCreatedEvent(event);
        break;
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.DONATION_MADE),
      ):
        this.handleDonationMadeEvent(event);
        break;
      case validateAndParseAddress(
        hash.getSelectorFromName(constants.event_names.WITHDRAWAL_MADE),
      ):
        this.handleWithdrawalMadeEvent(event);
        break;
      case validateAndParseAddress(
        hash.getSelectorFromName(
          constants.event_names.DEPLOYED_TOKEN_GIVER_NFT,
        ),
      ):
        this.handleDeployedTokenGiverNftEvent(event);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventKey}`);
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

    //updating the specific campaign's donation total
    await this.prismaService.campaign.update({
      where: { campaign_address: campaignAddress },
      data: {
        total_donations: {
          increment: Number(amount),
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

    await this.prismaService.campaign.update({
      where: { campaign_id: campaignId },
      data: {
        token_giver_nft_contract_address: tokenGiverNftContractAddress,
      },
    });
  }
}
