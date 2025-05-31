import { IndexerConfig } from 'src/common/types';

export interface ISharedIndexerService {
    registerIndexer(eventKeys: string[], handler: (data: any) => Promise<void>): void;
    onModuleInit(): void;
}

export const SHARED_INDEXER_SERVICE = 'SHARED_INDEXER_SERVICE'; 