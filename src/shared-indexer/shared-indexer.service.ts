import { Injectable, Logger } from '@nestjs/common';
import { StreamClient, v1alpha2 } from '@apibara/protocol';
import {
  FieldElement,
  Filter,
  v1alpha2 as starknet,
  StarkNetCursor,
} from '@apibara/starknet';
import constants from 'src/common/constants';
import { env } from 'src/common/env';
import { IndexerConfig } from 'src/common/types';

@Injectable()
export class SharedIndexerService {
  private readonly logger = new Logger(SharedIndexerService.name);
  private readonly client: StreamClient;
  private configs: IndexerConfig[] = [];

  constructor() {
    this.client = new StreamClient({
      url: env.indexer.dnaClientUrl,
      clientOptions: {
        'grpc.max_receive_message_length':
          constants.apibara.maxReceiveMessageLength,
      },
      token: env.indexer.dnaToken,
    });
  }

  onModuleInit() {
    this.startIndexer();
  }

  registerIndexer(eventKeys: string[], handler: (data: any) => Promise<void>) {
    this.configs.push({ eventKeys, handler });
  }

  private async startIndexer() {
    if (this.configs.length === 0) {
      this.logger.warn('No indexers registered. Skipping indexer start.');
      return;
    }

    this.logger.log('Starting shared indexer...');

    const combinedFilter = this.combineFilters();

    this.client.configure({
      filter: combinedFilter,
      batchSize: 1,
      finality: v1alpha2.DataFinality.DATA_STATUS_FINALIZED,
      //! cursor
      //? we should prolly have a record for latest cursor and use that
      //? so that when system has a restart for what ever reasons
      //? it doesn't start polling data from the beginning
      cursor: StarkNetCursor.createWithBlockNumber(0),
    });

    for await (const message of this.client) {
      this.logger.debug(`Received message: ${message.message}`);
      if (message.message === 'data') {
        await this.handleDataMessage(message.data);
      }
    }
  }

  private combineFilters(): Uint8Array {
    const combinedFilter = Filter.create().withHeader({ weak: true });
    const allEventKeys = this.configs.flatMap((config) => config.eventKeys);
    const uniqueEventKeys = [...new Set(allEventKeys)];

    uniqueEventKeys.forEach((eventKey) => {
      combinedFilter.addEvent((event) =>
        event.withKeys([FieldElement.fromBigInt(BigInt(eventKey))]),
      );
    });

    return combinedFilter.encode();
  }

  private async handleDataMessage(dataMessage: any) {
    //TODO:  handle cursor and finality
    const { data } = dataMessage;
    for (const item of data) {
      const block = starknet.Block.decode(item);
      for (const event of block.events) {
        const eventKey = FieldElement.toHex(event.event.keys[0]);

        const matchingConfigs = this.configs.filter((config) =>
          config.eventKeys.includes(eventKey),
        );

        for (const config of matchingConfigs) {
          await config.handler(event.event);
        }
      }
    }
  }
}
