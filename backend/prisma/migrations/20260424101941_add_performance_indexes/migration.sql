/*
  Warnings:

  - A unique constraint covering the columns `[variantId,slotNumber]` on the table `VariantSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "AccommodationBooking_userId_idx" ON "AccommodationBooking"("userId");

-- CreateIndex
CREATE INDEX "AccommodationBooking_roomTypeId_idx" ON "AccommodationBooking"("roomTypeId");

-- CreateIndex
CREATE INDEX "AccommodationLock_status_expiresAt_idx" ON "AccommodationLock"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "AccommodationLock_userId_idx" ON "AccommodationLock"("userId");

-- CreateIndex
CREATE INDEX "AccommodationLock_roomTypeId_idx" ON "AccommodationLock"("roomTypeId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_dealId_idx" ON "Booking"("dealId");

-- CreateIndex
CREATE INDEX "Booking_variantId_paymentStatus_idx" ON "Booking"("variantId", "paymentStatus");

-- CreateIndex
CREATE INDEX "CommunityComment_postId_idx" ON "CommunityComment"("postId");

-- CreateIndex
CREATE INDEX "CommunityComment_parentId_idx" ON "CommunityComment"("parentId");

-- CreateIndex
CREATE INDEX "CommunityComment_userId_idx" ON "CommunityComment"("userId");

-- CreateIndex
CREATE INDEX "CommunityLike_postId_idx" ON "CommunityLike"("postId");

-- CreateIndex
CREATE INDEX "CommunityLike_commentId_idx" ON "CommunityLike"("commentId");

-- CreateIndex
CREATE INDEX "CommunityMedia_postId_idx" ON "CommunityMedia"("postId");

-- CreateIndex
CREATE INDEX "CommunityMedia_commentId_idx" ON "CommunityMedia"("commentId");

-- CreateIndex
CREATE INDEX "CommunityPost_userId_idx" ON "CommunityPost"("userId");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "Deal_merchantId_createdAt_idx" ON "Deal"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "Deal_isActive_location_category_idx" ON "Deal"("isActive", "location", "category");

-- CreateIndex
CREATE INDEX "DealLock_status_expiresAt_idx" ON "DealLock"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "DealLock_userId_idx" ON "DealLock"("userId");

-- CreateIndex
CREATE INDEX "DealLock_dealId_idx" ON "DealLock"("dealId");

-- CreateIndex
CREATE INDEX "DealLock_variantId_idx" ON "DealLock"("variantId");

-- CreateIndex
CREATE INDEX "DealRequest_userId_idx" ON "DealRequest"("userId");

-- CreateIndex
CREATE INDEX "DealVariant_status_idx" ON "DealVariant"("status");

-- CreateIndex
CREATE INDEX "Exclusions_dealId_idx" ON "Exclusions"("dealId");

-- CreateIndex
CREATE INDEX "Inclusions_dealId_idx" ON "Inclusions"("dealId");

-- CreateIndex
CREATE INDEX "Itinerary_dealId_idx" ON "Itinerary"("dealId");

-- CreateIndex
CREATE INDEX "MerchantProfile_verificationStatus_idx" ON "MerchantProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "Property_merchantId_idx" ON "Property"("merchantId");

-- CreateIndex
CREATE INDEX "RecurringRule_dealId_idx" ON "RecurringRule"("dealId");

-- CreateIndex
CREATE INDEX "RoomType_propertyId_idx" ON "RoomType"("propertyId");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "VariantSlot_variantId_status_idx" ON "VariantSlot"("variantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VariantSlot_variantId_slotNumber_key" ON "VariantSlot"("variantId", "slotNumber");
