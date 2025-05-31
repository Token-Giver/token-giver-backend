import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PRISMA_SERVICE } from './prisma.interface';

@Module({
  providers: [
    {
      provide: PRISMA_SERVICE,
      useClass: PrismaService,
    },
  ],
  exports: [PRISMA_SERVICE],
})
export class PrismaModule { }
