CREATE DATABASE IF NOT EXISTS `newwheel`;
USE `newwheel`;

CREATE TABLE IF NOT EXISTS `characters` (
  `citizenId` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `license` varchar(50) NOT NULL,
  `firstName` varchar(50) NOT NULL DEFAULT 'John',
  `lastName` varchar(50) NOT NULL DEFAULT 'Doe',
  `dob` bigint NOT NULL DEFAULT '0',
  `height` int NOT NULL DEFAULT '0',
  `sex` varchar(15) NOT NULL,
  `nationality` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `backstory` text CHARACTER SET utf8 COLLATE utf8_general_ci,
  `coords` text,
  PRIMARY KEY (`citizenId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `players` (
  `license` varchar(90) NOT NULL,
  `name` varchar(90) NOT NULL,
  `groupName` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'user',
  `firstLogin` bigint NOT NULL DEFAULT '0',
  `lastLogin` bigint NOT NULL DEFAULT '0',
  `playTime` bigint DEFAULT NULL,
  PRIMARY KEY (`license`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;