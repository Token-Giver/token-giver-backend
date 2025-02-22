-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_id" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "campaign_id" INTEGER NOT NULL,
    "token_id" INTEGER,
    "campaign_address" TEXT,
    "campaign_owner" TEXT,
    "nft_token_uri" TEXT,
    "token_giver_nft_contract_address" TEXT,
    "campaign_name" TEXT NOT NULL,
    "campaign_description" TEXT NOT NULL,
    "cover_photo" TEXT NOT NULL,
    "social_links" JSONB,
    "target_amount" INTEGER NOT NULL,
    "total_donations" INTEGER DEFAULT 0,
    "organizer" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "category_id" INTEGER,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("campaign_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_token_id_key" ON "Campaign"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_campaign_address_key" ON "Campaign"("campaign_address");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("campaign_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
