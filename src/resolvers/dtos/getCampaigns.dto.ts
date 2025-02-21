import { Field, ObjectType } from "@nestjs/graphql";
import { Campaign } from "../models/campaign.model";

@ObjectType()
export class CampaignConnection {
    @Field(() => [Campaign])
    items: Campaign[];

    @Field(() => String, { nullable: true })
    endCursor?: string;

    @Field(() => Boolean)
    hasNextPage: boolean;
}
