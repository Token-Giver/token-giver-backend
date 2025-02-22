import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

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

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  category_id?: number;
}
