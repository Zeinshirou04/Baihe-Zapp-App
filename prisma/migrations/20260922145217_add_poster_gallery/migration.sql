-- CreateTable
CREATE TABLE `posters` (
    `id` VARCHAR(191) NOT NULL,
    `seriesId` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `isThumb` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `posters_seriesId_idx`(`seriesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posters` ADD CONSTRAINT `posters_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
