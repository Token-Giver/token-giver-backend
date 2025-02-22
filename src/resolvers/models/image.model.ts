import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Image {
  @Field()
  id: string;

  @Field()
  url: string;

  @Field(() => Int)
  campaign_id: number;

  @Field()
  created_at: Date;
}
