# Dump of table User
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL DEFAULT '',
  `loginCount` int(11) unsigned DEFAULT '0',
  `money` bigint(25) unsigned DEFAULT '0',
  `lastLoginTime` bigint(20) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_ACCOUNT_NAME` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

