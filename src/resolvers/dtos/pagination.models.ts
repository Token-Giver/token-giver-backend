import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Campaign } from '../models/campaign.model';

@ObjectType()
export class PaginatedCampaigns {
  @Field(() => [Campaign])
  campaigns: Campaign[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int, { nullable: true })
  skip?: number;
}
