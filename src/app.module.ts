import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import GraphQLJSON from 'graphql-type-json';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SharedIndexerModule } from './shared-indexer/shared-indexer.module';
import { TokenGiverIndexerModule } from './token-giver-indexer/token-giver-indexer.module';
import { ResolversModule } from './resolvers/resolvers.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      resolvers: { JSON: GraphQLJSON },
    }),
    PrismaModule,
    SharedIndexerModule,
    TokenGiverIndexerModule,
    ResolversModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
