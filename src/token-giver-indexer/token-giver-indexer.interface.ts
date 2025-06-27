import { v1alpha2 as starknet } from '@apibara/starknet';

export interface ITokenGiverIndexerService {
    onModuleInit(): Promise<void>;
    handleEvents(event: starknet.IEvent): Promise<void>;
}

export const TOKEN_GIVER_INDEXER_SERVICE = 'TOKEN_GIVER_INDEXER_SERVICE'; 