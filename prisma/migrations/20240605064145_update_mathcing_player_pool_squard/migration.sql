-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cash` INTEGER NOT NULL,

    UNIQUE INDEX `User_accountName_key`(`accountName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `speed` INTEGER NOT NULL,
    `passing` INTEGER NOT NULL,
    `dribbling` INTEGER NOT NULL,
    `heading` INTEGER NOT NULL,
    `shooting` INTEGER NOT NULL,
    `tackling` INTEGER NOT NULL,
    `marking` INTEGER NOT NULL,
    `strength` INTEGER NOT NULL,
    `weight` INTEGER NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerPool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Squard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `playerPoolId` INTEGER NOT NULL,

    UNIQUE INDEX `Squard_playerPoolId_key`(`playerPoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matching` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userHomeId` INTEGER NOT NULL,
    `userAwayId` INTEGER NOT NULL,
    `result` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlayerPool` ADD CONSTRAINT `PlayerPool_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerPool` ADD CONSTRAINT `PlayerPool_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Squard` ADD CONSTRAINT `Squard_playerPoolId_fkey` FOREIGN KEY (`playerPoolId`) REFERENCES `PlayerPool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Squard` ADD CONSTRAINT `Squard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matching` ADD CONSTRAINT `Matching_userHomeId_fkey` FOREIGN KEY (`userHomeId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matching` ADD CONSTRAINT `Matching_userAwayId_fkey` FOREIGN KEY (`userAwayId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
