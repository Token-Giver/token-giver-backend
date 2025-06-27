import { Module } from '@nestjs/common';
import { TokenGiverIndexerService } from './token-giver-indexer.service';
import { SharedIndexerModule } from 'src/shared-indexer/shared-indexer.module';
import { TOKEN_GIVER_INDEXER_SERVICE } from './token-giver-indexer.interface';
import { PRISMA_SERVICE } from 'src/prisma/prisma.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [SharedIndexerModule],
  providers: [
    {
      provide: TOKEN_GIVER_INDEXER_SERVICE,
      useClass: TokenGiverIndexerService,
    },
    {
      provide: PRISMA_SERVICE,
      useClass: PrismaService,
    },
  ],
  exports: [TOKEN_GIVER_INDEXER_SERVICE],
})
export class TokenGiverIndexerModule { }
