-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `series` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleHanzi` VARCHAR(191) NOT NULL,
    `titleLatin` VARCHAR(191) NOT NULL,
    `titlePinyin` VARCHAR(191) NULL,
    `synopsis` VARCHAR(191) NULL,
    `posterPath` VARCHAR(191) NULL,
    `status` ENUM('ONGOING', 'COMPLETED', 'HIATUS') NOT NULL DEFAULT 'ONGOING',
    `year` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `series_slug_key`(`slug`),
    INDEX `series_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persons` (
    `id` VARCHAR(191) NOT NULL,
    `nameHanzi` VARCHAR(191) NULL,
    `nameLatin` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `avatarPath` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `persons_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `series_cast` (
    `id` VARCHAR(191) NOT NULL,
    `seriesId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `characterName` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `series_cast_seriesId_idx`(`seriesId`),
    INDEX `series_cast_personId_idx`(`personId`),
    UNIQUE INDEX `series_cast_seriesId_personId_key`(`seriesId`, `personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `episodes` (
    `id` VARCHAR(191) NOT NULL,
    `seriesId` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NULL,
    `durationMs` INTEGER NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `importBatchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `episodes_seriesId_idx`(`seriesId`),
    UNIQUE INDEX `episodes_seriesId_number_key`(`seriesId`, `number`),
    UNIQUE INDEX `episodes_seriesId_slug_key`(`seriesId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `episode_contributors` (
    `id` VARCHAR(191) NOT NULL,
    `episodeId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,
    `role` ENUM('TRANSLATOR', 'EDITOR', 'PROOFREADER') NOT NULL,

    INDEX `episode_contributors_episodeId_idx`(`episodeId`),
    INDEX `episode_contributors_personId_idx`(`personId`),
    UNIQUE INDEX `episode_contributors_episodeId_personId_role_key`(`episodeId`, `personId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lines` (
    `id` VARCHAR(191) NOT NULL,
    `episodeId` VARCHAR(191) NOT NULL,
    `idx` INTEGER NOT NULL,
    `startMs` INTEGER NOT NULL,
    `endMs` INTEGER NULL,
    `hanzi` VARCHAR(191) NOT NULL,
    `pinyin` VARCHAR(191) NOT NULL,
    `pinyinTokens` JSON NOT NULL,
    `translationEn` VARCHAR(191) NOT NULL,
    `speakerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lines_episodeId_idx`(`episodeId`),
    INDEX `lines_speakerId_idx`(`speakerId`),
    UNIQUE INDEX `lines_episodeId_idx_key`(`episodeId`, `idx`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `import_batches` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `series_cast` ADD CONSTRAINT `series_cast_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `series_cast` ADD CONSTRAINT `series_cast_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `persons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episodes` ADD CONSTRAINT `episodes_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episodes` ADD CONSTRAINT `episodes_importBatchId_fkey` FOREIGN KEY (`importBatchId`) REFERENCES `import_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episode_contributors` ADD CONSTRAINT `episode_contributors_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `episodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episode_contributors` ADD CONSTRAINT `episode_contributors_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `persons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lines` ADD CONSTRAINT `lines_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `episodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lines` ADD CONSTRAINT `lines_speakerId_fkey` FOREIGN KEY (`speakerId`) REFERENCES `persons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
