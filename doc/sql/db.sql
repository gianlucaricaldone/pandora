CREATE TABLE `candela` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `data` varchar(25) DEFAULT NULL,
  `symbol` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `interval` varchar(10) DEFAULT NULL,
  `open` varchar(25) DEFAULT NULL,
  `close` varchar(25) DEFAULT NULL,
  `high` varchar(25) DEFAULT NULL,
  `low` varchar(25) DEFAULT NULL,
  `x` tinyint(1) DEFAULT NULL,
  `start_time` varchar(25) DEFAULT NULL,
  `close_time` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `START_UNIQUE` (`start_time`)
) ENGINE=InnoDB AUTO_INCREMENT=671 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `ordine` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `link` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `link_type` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pandora_type` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `open` tinyint NOT NULL DEFAULT '0',
  `closed` tinyint NOT NULL DEFAULT '0',
  `cancelled` tinyint NOT NULL DEFAULT '0',
  `symbol` varchar(25) DEFAULT NULL,
  `side` varchar(25) DEFAULT NULL,
  `type` varchar(25) DEFAULT NULL,
  `amount` varchar(25) DEFAULT NULL,
  `price` varchar(25) DEFAULT NULL,
  `params` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;