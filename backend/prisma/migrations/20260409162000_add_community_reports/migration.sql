-- CreateTable
CREATE TABLE "CommunityPostReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityPostReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityCommentReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityCommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPostReport_userId_postId_key" ON "CommunityPostReport" ("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityCommentReport_userId_commentId_key" ON "CommunityCommentReport" ("userId", "commentId");

-- AddForeignKey
ALTER TABLE "CommunityPostReport"
ADD CONSTRAINT "CommunityPostReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostReport"
ADD CONSTRAINT "CommunityPostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCommentReport"
ADD CONSTRAINT "CommunityCommentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCommentReport"
ADD CONSTRAINT "CommunityCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE;