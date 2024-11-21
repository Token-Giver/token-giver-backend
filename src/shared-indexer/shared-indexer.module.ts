import { Module } from '@nestjs/common';
import { SharedIndexerService } from './shared-indexer.service';

@Module({
  providers: [SharedIndexerService],
  exports: [SharedIndexerService],
})
export class SharedIndexerModule {}
