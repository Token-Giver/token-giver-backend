import { Module } from '@nestjs/common';
import { TokenGiverIndexerService } from './token-giver-indexer.service';
import { SharedIndexerModule } from 'src/shared-indexer/shared-indexer.module';

@Module({
  providers: [TokenGiverIndexerService],
  imports: [SharedIndexerModule],
})
export class TokenGiverIndexerModule {}
