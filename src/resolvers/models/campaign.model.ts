import { ObjectType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Category } from './category.model';
import { JsonValue } from '@prisma/client/runtime/library';

@ObjectType()
export class Campaign {
  @Field(() => Int)
  campaign_id: number;

  @Field(() => Int, { nullable: true })
  token_id: number;

  @Field({ nullable: true })
  campaign_address: string;

  @Field({ nullable: true })
  campaign_owner: string;

  @Field({ nullable: true })
  nft_token_uri: string;

  @Field({ nullable: true })
  token_giver_nft_contract_address: string;

  @Field()
  campaign_name: string;

  @Field()
  campaign_description: string;

  @Field()
  cover_photo: string;

  @Field(() => GraphQLJSON, { nullable: true })
  social_links?: JsonValue;

  @Field(() => Int)
  target_amount: number;

  @Field(() => Int, { nullable: true })
  total_donations?: number;

  @Field()
  organizer: string;

  @Field()
  beneficiary: string;

  @Field(() => [String])
  campaign_images: string[];

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => Int, { nullable: true })
  category_id?: number;

  @Field({ nullable: true })
  updated_at?: Date;

  @Field({ nullable: true })
  created_at?: Date;
}
