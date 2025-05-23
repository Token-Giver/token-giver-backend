import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { InputJsonObject } from '@prisma/client/runtime/library';

@InputType()
export class CampaignCreateInput {
  @Field(() => Int)
  @IsInt()
  campaign_id: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  campaign_name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  campaign_description: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  cover_photo: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  campaign_images?: string[];

  @Field(() => Int)
  @IsInt()
  target_amount: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalDonations?: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  organizer: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  beneficiary: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  location: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  category_id?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  social_links?: InputJsonObject;
}
