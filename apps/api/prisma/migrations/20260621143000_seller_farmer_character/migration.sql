CREATE TYPE "FarmerGender" AS ENUM ('MALE', 'FEMALE');

ALTER TABLE "SellerProfile"
ADD COLUMN "gender" "FarmerGender",
ADD COLUMN "avatarKey" VARCHAR(20);
