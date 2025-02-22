import { InputType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { InputJsonObject } from '@prisma/client/runtime/library';

@InputType()
export class CampaignCreateInput {
  @Field(() => Int)
  campaign_id: number;

  @Field(() => String)
  campaign_name: string;

  @Field(() => String)
  campaign_description: string;

  @Field(() => String)
  cover_photo: string;

  @Field(() => GraphQLJSON, { nullable: true })
  social_links?: InputJsonObject;

  @Field(() => Int)
  target_amount: number;

  @Field(() => Int, { nullable: true })
  total_donations?: number;

  @Field(() => String)
  organizer: string;

  @Field(() => String)
  beneficiary: string;

  @Field(() => Int, { nullable: true })
  category_id?: number;
}
