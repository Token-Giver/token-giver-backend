import { Module } from '@nestjs/common';
import { SharedIndexerService } from './shared-indexer.service';
import { TokenGiverIndexerService } from 'src/token-giver-indexer/token-giver-indexer.service';

@Module({
  imports: [],
  providers: [TokenGiverIndexerService, SharedIndexerService],
  exports: [SharedIndexerService],
})
export class SharedIndexerModule {}
