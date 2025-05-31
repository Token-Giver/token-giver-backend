import { Module } from '@nestjs/common';
import { SharedIndexerService } from './shared-indexer.service';
import { SHARED_INDEXER_SERVICE } from './shared-indexer.interface';

@Module({
  imports: [],
  providers: [
    {
      provide: SHARED_INDEXER_SERVICE,
      useClass: SharedIndexerService,
    },
  ],
  exports: [SHARED_INDEXER_SERVICE],
})
export class SharedIndexerModule { }
