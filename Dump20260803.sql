-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: eventfinder_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts_organizerprofile`
--

DROP TABLE IF EXISTS `accounts_organizerprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_organizerprofile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `organization_name` varchar(200) NOT NULL,
  `government_id` varchar(100) NOT NULL,
  `address` longtext NOT NULL,
  `approval_status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `accounts_organizerprofile_user_id_ea1f0603_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_organizerprofile`
--

LOCK TABLES `accounts_organizerprofile` WRITE;
/*!40000 ALTER TABLE `accounts_organizerprofile` DISABLE KEYS */;
INSERT INTO `accounts_organizerprofile` VALUES (3,'LiveNation Events','','123 Music Avenue, Mumbai, Maharashtra,mbh','APPROVED','2026-07-18 08:07:03.240623','2026-07-22 07:02:39.877649',11),(4,'Fiesta Productions','','456 Festival Road, Bangalore, Karnataka','APPROVED','2026-07-18 08:07:03.257957','2026-07-18 08:07:03.258001',12),(6,'Brandd','government_ids/press-button.png','tght','APPROVED','2026-07-18 09:34:45.867136','2026-07-20 06:10:39.097356',18);
/*!40000 ALTER TABLE `accounts_organizerprofile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_profileeditrequest`
--

DROP TABLE IF EXISTS `accounts_profileeditrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_profileeditrequest` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `proposed_data` json NOT NULL,
  `status` varchar(20) NOT NULL,
  `admin_notes` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `reviewed_by_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `accounts_profileedit_reviewed_by_id_194aaf5c_fk_accounts_` (`reviewed_by_id`),
  KEY `accounts_profileeditrequest_user_id_16903795_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `accounts_profileedit_reviewed_by_id_194aaf5c_fk_accounts_` FOREIGN KEY (`reviewed_by_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `accounts_profileeditrequest_user_id_16903795_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_profileeditrequest`
--

LOCK TABLES `accounts_profileeditrequest` WRITE;
/*!40000 ALTER TABLE `accounts_profileeditrequest` DISABLE KEYS */;
INSERT INTO `accounts_profileeditrequest` VALUES (1,'{\"last_name\": \"frthrt\", \"first_name\": \"John\"}','APPROVED','','2026-07-22 06:42:07.207387','2026-07-22 06:43:34.629476',10,22),(2,'{\"address\": \"123 Music Avenue, Mumbai, Maharashtra,mh\"}','APPROVED','','2026-07-22 06:46:18.384875','2026-07-22 06:56:19.685110',10,11),(3,'{\"last_name\": \"Sharmak\"}','APPROVED','','2026-07-22 06:56:37.652751','2026-07-22 06:57:10.860070',10,11),(4,'{\"address\": \"123 Music Avenue, Mumbai, Maharashtra,mbh\", \"last_name\": \"Sharmak\"}','APPROVED','','2026-07-22 06:57:20.499871','2026-07-22 06:57:52.036579',10,11),(5,'{\"address\": \"123 Music Avenue, Mumbai, Maharashtra,mbh\", \"last_name\": \"Sharmak\", \"first_name\": \"Rahulp\"}','APPROVED','','2026-07-22 07:00:25.018126','2026-07-22 07:02:39.882363',10,11),(6,'{\"last_name\": \"frthrtp\"}','APPROVED','','2026-07-22 07:00:38.222995','2026-07-22 07:02:49.747428',10,22);
/*!40000 ALTER TABLE `accounts_profileeditrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_user`
--

DROP TABLE IF EXISTS `accounts_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `role` varchar(20) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `profile_picture` varchar(100) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_user`
--

LOCK TABLES `accounts_user` WRITE;
/*!40000 ALTER TABLE `accounts_user` DISABLE KEYS */;
INSERT INTO `accounts_user` VALUES (10,'pbkdf2_sha256$1200000$qA9a1m3cUsL3SY9MuLPNGo$mF9nUO+EWkzKRNNj1TdCzjhSBgZc01s0k80iYja+zPE=',NULL,1,'admin','Admin','adu','admin@eventfinder.com',1,1,'2026-07-18 08:06:52.235975','ADMIN','+919000000001','',1,'2026-07-18 08:06:53.722654','2026-07-22 06:39:52.137636'),(11,'pbkdf2_sha256$1200000$4vfEfkBI8iXGwm967fx2nN$DdtiBZ5N2VpdwXmM1CaqtrBZoE50tXOXRG8mlqlUQWk=',NULL,0,'organizer1','Rahulp','Sharmak','organizer1@eventfinder.com',0,1,'2026-07-18 08:06:53.727591','ORGANIZER','+919000000002','',1,'2026-07-18 08:06:55.275426','2026-07-22 07:02:39.869491'),(12,'pbkdf2_sha256$1200000$70Hr7ihwsHlnzFRt32oy37$N0XLxlbpjRScfTr5ZSRTB9d1o/JZh4C+HwzB9N/IXQw=',NULL,0,'organizer2','Priya','Patel','organizer2@eventfinder.com',0,1,'2026-07-18 08:06:55.325227','ORGANIZER','+919000000003','',1,'2026-07-18 08:06:56.840023','2026-07-18 08:06:56.840036'),(13,'pbkdf2_sha256$1200000$z5nR2zs3PajCp7sPq7kyPV$TZkJQlranapyaQgrG1LP8e8c38f2BCcqXJIZSrq6GaQ=',NULL,0,'user1','Amit','Kumar','user1@eventfinder.com',0,1,'2026-07-18 08:06:56.929016','USER','+919000000004','',1,'2026-07-18 08:06:58.414251','2026-07-20 06:08:30.367869'),(14,'pbkdf2_sha256$1200000$NyLTg4YoU3C9seqsJaCj1w$GCjy4o9uLU5XWcFEZ1FUSy8SXPpNUiOuwCk45ZGeCp0=',NULL,0,'user2','Sneha','Reddy','user2@eventfinder.com',0,1,'2026-07-18 08:06:58.515817','USER','+919000000005','',1,'2026-07-18 08:07:00.041034','2026-07-18 08:07:00.041047'),(15,'pbkdf2_sha256$1200000$qcPTbKhoqZLa6QuwKxpCf5$BPsOXRxVeBtXumpt377cJExUaksBH+ufZnAqVK3VAiE=',NULL,0,'user3','Vikram','Singh','user3@eventfinder.com',0,1,'2026-07-18 08:07:00.072076','USER','+919000000006','',1,'2026-07-18 08:07:01.499488','2026-07-18 08:07:01.499503'),(16,'pbkdf2_sha256$1200000$VGThskO3rvkGBUZXn3sqwr$7KwGx8AyHwHXHcgvzsZPk2fcnRWf666WbMPWDKkwyOc=',NULL,0,'user4','Neha','Gupta','user4@eventfinder.com',0,1,'2026-07-18 08:07:01.621571','USER','+919000000007','',1,'2026-07-18 08:07:03.119986','2026-07-18 08:07:03.119999'),(18,'pbkdf2_sha256$1200000$CJG5fhqHFG326OAaz0Ejsl$jCFaCpF5yLmfoCnQk7b6oIsS5hgLCBZi8+ShD9w4PGg=',NULL,0,'johndoe','John','Doe','johndoe@gmail.com',0,1,'2026-07-18 09:34:44.431085','ORGANIZER',NULL,'',0,'2026-07-18 09:34:45.813729','2026-07-18 09:34:45.813750'),(19,'pbkdf2_sha256$1200000$cbIwKCNT6qxgFfJGHaxZFW$mSUo5b+AxtN4riHI3J3kD9h45i26CedNyN/aMkeiAs8=',NULL,0,'johndoe1','John','Doe','johndoe@eventfinder.com',0,1,'2026-07-18 10:33:26.138977','USER',NULL,'',0,'2026-07-18 10:33:27.562610','2026-07-18 10:33:27.562625'),(20,'pbkdf2_sha256$1200000$BGMVWyOz1uYIWjKecMSPXx$ao/G+i0mlw9zXpAm5/RyOAm3o3Z+itcHLSXpkRbEKUA=',NULL,0,'nashwa','NASHWA','VP','nashwa@eventfinder.com',0,1,'2026-07-18 11:03:58.770765','USER',NULL,'',0,'2026-07-18 11:04:00.187586','2026-07-18 11:04:00.187609'),(21,'pbkdf2_sha256$1200000$XC21JGfgYOMJSu3vw8YKc2$7+oRz45x/SSo4cZ4FEzaJ30mvPs8k4u7yD1PCM2/9nA=',NULL,1,'admin1','','','',1,1,'2026-07-20 05:54:42.931509','USER',NULL,'',0,'2026-07-20 05:54:44.267861','2026-07-20 05:54:44.267879'),(22,'pbkdf2_sha256$1200000$EGsXTixluKwVilIpJEfjwB$c9OhFvcbocZqWiceMbd+0pJBTQRjY4r4VWURbWaNNac=',NULL,1,'adminn','John','frthrtp','adminn@gmail.com',1,1,'2026-07-20 05:55:28.907250','USER',NULL,'',0,'2026-07-20 05:55:30.236218','2026-07-22 07:02:49.740965');
/*!40000 ALTER TABLE `accounts_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_user_groups`
--

DROP TABLE IF EXISTS `accounts_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_user_groups_user_id_group_id_59c0b32f_uniq` (`user_id`,`group_id`),
  KEY `accounts_user_groups_group_id_bd11a704_fk_auth_group_id` (`group_id`),
  CONSTRAINT `accounts_user_groups_group_id_bd11a704_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `accounts_user_groups_user_id_52b62117_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_user_groups`
--

LOCK TABLES `accounts_user_groups` WRITE;
/*!40000 ALTER TABLE `accounts_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_user_user_permissions`
--

DROP TABLE IF EXISTS `accounts_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_user_user_permi_user_id_permission_id_2ab516c2_uniq` (`user_id`,`permission_id`),
  KEY `accounts_user_user_p_permission_id_113bb443_fk_auth_perm` (`permission_id`),
  CONSTRAINT `accounts_user_user_p_permission_id_113bb443_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `accounts_user_user_p_user_id_e4f0a161_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_user_user_permissions`
--

LOCK TABLES `accounts_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `accounts_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auctions_eventbid`
--

DROP TABLE IF EXISTS `auctions_eventbid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auctions_eventbid` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `event_plan` longtext NOT NULL,
  `proposed_date` date NOT NULL,
  `proposed_time` time(6) DEFAULT NULL,
  `venue` varchar(255) NOT NULL,
  `ticket_price` decimal(10,2) NOT NULL,
  `capacity` int unsigned NOT NULL,
  `budget_estimation` decimal(10,2) NOT NULL,
  `benefits_included` longtext NOT NULL,
  `additional_ideas` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `organizer_id` bigint NOT NULL,
  `request_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auctions_eventbid_request_id_organizer_id_cb735d14_uniq` (`request_id`,`organizer_id`),
  KEY `auctions_ev_request_ce0585_idx` (`request_id`,`status`),
  KEY `auctions_ev_organiz_751cfa_idx` (`organizer_id`,`status`),
  CONSTRAINT `auctions_eventbid_organizer_id_62cd7ff7_fk_accounts_user_id` FOREIGN KEY (`organizer_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `auctions_eventbid_request_id_54b65cea_fk_auctions_` FOREIGN KEY (`request_id`) REFERENCES `auctions_eventrequest` (`id`),
  CONSTRAINT `auctions_eventbid_chk_1` CHECK ((`capacity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auctions_eventbid`
--

LOCK TABLES `auctions_eventbid` WRITE;
/*!40000 ALTER TABLE `auctions_eventbid` DISABLE KEYS */;
/*!40000 ALTER TABLE `auctions_eventbid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auctions_eventrequest`
--

DROP TABLE IF EXISTS `auctions_eventrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auctions_eventrequest` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `preferred_location` varchar(255) NOT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time(6) DEFAULT NULL,
  `expected_attendees` int unsigned NOT NULL,
  `budget_min` decimal(10,2) NOT NULL,
  `budget_max` decimal(10,2) NOT NULL,
  `additional_requirements` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `demand_level` varchar(10) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `converted_event_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auctions_ev_status_d94b8e_idx` (`status`,`created_at` DESC),
  KEY `auctions_ev_categor_7104fd_idx` (`category_id`,`status`),
  KEY `auctions_eventreques_converted_event_id_6ce3a034_fk_events_ev` (`converted_event_id`),
  KEY `auctions_eventrequest_user_id_ea12b838_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `auctions_eventreques_converted_event_id_6ce3a034_fk_events_ev` FOREIGN KEY (`converted_event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `auctions_eventrequest_category_id_d9f01a2f_fk_events_category_id` FOREIGN KEY (`category_id`) REFERENCES `events_category` (`id`),
  CONSTRAINT `auctions_eventrequest_user_id_ea12b838_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `auctions_eventrequest_chk_1` CHECK ((`expected_attendees` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auctions_eventrequest`
--

LOCK TABLES `auctions_eventrequest` WRITE;
/*!40000 ALTER TABLE `auctions_eventrequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `auctions_eventrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auctions_eventrequestcomment`
--

DROP TABLE IF EXISTS `auctions_eventrequestcomment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auctions_eventrequestcomment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `request_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auctions_ev_request_345aed_idx` (`request_id`,`created_at`),
  KEY `auctions_eventreques_user_id_f3388a83_fk_accounts_` (`user_id`),
  CONSTRAINT `auctions_eventreques_request_id_8c9dfa0a_fk_auctions_` FOREIGN KEY (`request_id`) REFERENCES `auctions_eventrequest` (`id`),
  CONSTRAINT `auctions_eventreques_user_id_f3388a83_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auctions_eventrequestcomment`
--

LOCK TABLES `auctions_eventrequestcomment` WRITE;
/*!40000 ALTER TABLE `auctions_eventrequestcomment` DISABLE KEYS */;
/*!40000 ALTER TABLE `auctions_eventrequestcomment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auctions_eventrequestsupport`
--

DROP TABLE IF EXISTS `auctions_eventrequestsupport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auctions_eventrequestsupport` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `request_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auctions_eventrequestsupport_request_id_user_id_f9352cfd_uniq` (`request_id`,`user_id`),
  KEY `auctions_eventreques_user_id_f0259038_fk_accounts_` (`user_id`),
  CONSTRAINT `auctions_eventreques_request_id_354897ec_fk_auctions_` FOREIGN KEY (`request_id`) REFERENCES `auctions_eventrequest` (`id`),
  CONSTRAINT `auctions_eventreques_user_id_f0259038_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auctions_eventrequestsupport`
--

LOCK TABLES `auctions_eventrequestsupport` WRITE;
/*!40000 ALTER TABLE `auctions_eventrequestsupport` DISABLE KEYS */;
/*!40000 ALTER TABLE `auctions_eventrequestsupport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add Token',6,'add_token'),(22,'Can change Token',6,'change_token'),(23,'Can delete Token',6,'delete_token'),(24,'Can view Token',6,'view_token'),(25,'Can add Token',7,'add_tokenproxy'),(26,'Can change Token',7,'change_tokenproxy'),(27,'Can delete Token',7,'delete_tokenproxy'),(28,'Can view Token',7,'view_tokenproxy'),(29,'Can add Blacklisted Token',8,'add_blacklistedtoken'),(30,'Can change Blacklisted Token',8,'change_blacklistedtoken'),(31,'Can delete Blacklisted Token',8,'delete_blacklistedtoken'),(32,'Can view Blacklisted Token',8,'view_blacklistedtoken'),(33,'Can add Outstanding Token',9,'add_outstandingtoken'),(34,'Can change Outstanding Token',9,'change_outstandingtoken'),(35,'Can delete Outstanding Token',9,'delete_outstandingtoken'),(36,'Can view Outstanding Token',9,'view_outstandingtoken'),(37,'Can add crontab',11,'add_crontabschedule'),(38,'Can change crontab',11,'change_crontabschedule'),(39,'Can delete crontab',11,'delete_crontabschedule'),(40,'Can view crontab',11,'view_crontabschedule'),(41,'Can add interval',12,'add_intervalschedule'),(42,'Can change interval',12,'change_intervalschedule'),(43,'Can delete interval',12,'delete_intervalschedule'),(44,'Can view interval',12,'view_intervalschedule'),(45,'Can add periodic task',13,'add_periodictask'),(46,'Can change periodic task',13,'change_periodictask'),(47,'Can delete periodic task',13,'delete_periodictask'),(48,'Can view periodic task',13,'view_periodictask'),(49,'Can add periodic task track',14,'add_periodictasks'),(50,'Can change periodic task track',14,'change_periodictasks'),(51,'Can delete periodic task track',14,'delete_periodictasks'),(52,'Can view periodic task track',14,'view_periodictasks'),(53,'Can add solar event',15,'add_solarschedule'),(54,'Can change solar event',15,'change_solarschedule'),(55,'Can delete solar event',15,'delete_solarschedule'),(56,'Can view solar event',15,'view_solarschedule'),(57,'Can add clocked',10,'add_clockedschedule'),(58,'Can change clocked',10,'change_clockedschedule'),(59,'Can delete clocked',10,'delete_clockedschedule'),(60,'Can view clocked',10,'view_clockedschedule'),(61,'Can add task result',18,'add_taskresult'),(62,'Can change task result',18,'change_taskresult'),(63,'Can delete task result',18,'delete_taskresult'),(64,'Can view task result',18,'view_taskresult'),(65,'Can add chord counter',16,'add_chordcounter'),(66,'Can change chord counter',16,'change_chordcounter'),(67,'Can delete chord counter',16,'delete_chordcounter'),(68,'Can view chord counter',16,'view_chordcounter'),(69,'Can add group result',17,'add_groupresult'),(70,'Can change group result',17,'change_groupresult'),(71,'Can delete group result',17,'delete_groupresult'),(72,'Can view group result',17,'view_groupresult'),(73,'Can add user',20,'add_user'),(74,'Can change user',20,'change_user'),(75,'Can delete user',20,'delete_user'),(76,'Can view user',20,'view_user'),(77,'Can add organizer profile',19,'add_organizerprofile'),(78,'Can change organizer profile',19,'change_organizerprofile'),(79,'Can delete organizer profile',19,'delete_organizerprofile'),(80,'Can view organizer profile',19,'view_organizerprofile'),(81,'Can add event',22,'add_event'),(82,'Can change event',22,'change_event'),(83,'Can delete event',22,'delete_event'),(84,'Can view event',22,'view_event'),(85,'Can add category',21,'add_category'),(86,'Can change category',21,'change_category'),(87,'Can delete category',21,'delete_category'),(88,'Can view category',21,'view_category'),(89,'Can add event image',23,'add_eventimage'),(90,'Can change event image',23,'change_eventimage'),(91,'Can delete event image',23,'delete_eventimage'),(92,'Can view event image',23,'view_eventimage'),(93,'Can add booking',24,'add_booking'),(94,'Can change booking',24,'change_booking'),(95,'Can delete booking',24,'delete_booking'),(96,'Can view booking',24,'view_booking'),(97,'Can add ticket',25,'add_ticket'),(98,'Can change ticket',25,'change_ticket'),(99,'Can delete ticket',25,'delete_ticket'),(100,'Can view ticket',25,'view_ticket'),(101,'Can add event experience',26,'add_eventexperience'),(102,'Can change event experience',26,'change_eventexperience'),(103,'Can delete event experience',26,'delete_eventexperience'),(104,'Can view event experience',26,'view_eventexperience'),(105,'Can add experience comment',27,'add_experiencecomment'),(106,'Can change experience comment',27,'change_experiencecomment'),(107,'Can delete experience comment',27,'delete_experiencecomment'),(108,'Can view experience comment',27,'view_experiencecomment'),(109,'Can add experience image',28,'add_experienceimage'),(110,'Can change experience image',28,'change_experienceimage'),(111,'Can delete experience image',28,'delete_experienceimage'),(112,'Can view experience image',28,'view_experienceimage'),(113,'Can add experience like',29,'add_experiencelike'),(114,'Can change experience like',29,'change_experiencelike'),(115,'Can delete experience like',29,'delete_experiencelike'),(116,'Can view experience like',29,'view_experiencelike'),(117,'Can add chat room',31,'add_chatroom'),(118,'Can change chat room',31,'change_chatroom'),(119,'Can delete chat room',31,'delete_chatroom'),(120,'Can view chat room',31,'view_chatroom'),(121,'Can add chat message',30,'add_chatmessage'),(122,'Can change chat message',30,'change_chatmessage'),(123,'Can delete chat message',30,'delete_chatmessage'),(124,'Can view chat message',30,'view_chatmessage'),(125,'Can add chat room member',32,'add_chatroommember'),(126,'Can change chat room member',32,'change_chatroommember'),(127,'Can delete chat room member',32,'delete_chatroommember'),(128,'Can view chat room member',32,'view_chatroommember'),(129,'Can add notification',34,'add_notification'),(130,'Can change notification',34,'change_notification'),(131,'Can delete notification',34,'delete_notification'),(132,'Can view notification',34,'view_notification'),(133,'Can add email notification',33,'add_emailnotification'),(134,'Can change email notification',33,'change_emailnotification'),(135,'Can delete email notification',33,'delete_emailnotification'),(136,'Can view email notification',33,'view_emailnotification'),(137,'Can add sms notification',35,'add_smsnotification'),(138,'Can change sms notification',35,'change_smsnotification'),(139,'Can delete sms notification',35,'delete_smsnotification'),(140,'Can view sms notification',35,'view_smsnotification'),(141,'Can add profile edit request',36,'add_profileeditrequest'),(142,'Can change profile edit request',36,'change_profileeditrequest'),(143,'Can delete profile edit request',36,'delete_profileeditrequest'),(144,'Can view profile edit request',36,'view_profileeditrequest'),(145,'Can add event request',38,'add_eventrequest'),(146,'Can change event request',38,'change_eventrequest'),(147,'Can delete event request',38,'delete_eventrequest'),(148,'Can view event request',38,'view_eventrequest'),(149,'Can add event bid',37,'add_eventbid'),(150,'Can change event bid',37,'change_eventbid'),(151,'Can delete event bid',37,'delete_eventbid'),(152,'Can view event bid',37,'view_eventbid'),(153,'Can add event request comment',39,'add_eventrequestcomment'),(154,'Can change event request comment',39,'change_eventrequestcomment'),(155,'Can delete event request comment',39,'delete_eventrequestcomment'),(156,'Can view event request comment',39,'view_eventrequestcomment'),(157,'Can add event request support',40,'add_eventrequestsupport'),(158,'Can change event request support',40,'change_eventrequestsupport'),(159,'Can delete event request support',40,'delete_eventrequestsupport'),(160,'Can view event request support',40,'view_eventrequestsupport'),(161,'Can add event black box report',41,'add_eventblackboxreport'),(162,'Can change event black box report',41,'change_eventblackboxreport'),(163,'Can delete event black box report',41,'delete_eventblackboxreport'),(164,'Can view event black box report',41,'view_eventblackboxreport'),(165,'Can add event feedback',42,'add_eventfeedback'),(166,'Can change event feedback',42,'change_eventfeedback'),(167,'Can delete event feedback',42,'delete_eventfeedback'),(168,'Can view event feedback',42,'view_eventfeedback'),(169,'Can add participant request',43,'add_participantrequest'),(170,'Can change participant request',43,'change_participantrequest'),(171,'Can delete participant request',43,'delete_participantrequest'),(172,'Can view participant request',43,'view_participantrequest'),(173,'Can add participant response',44,'add_participantresponse'),(174,'Can change participant response',44,'change_participantresponse'),(175,'Can delete participant response',44,'delete_participantresponse'),(176,'Can view participant response',44,'view_participantresponse'),(177,'Can add waitlist entry',45,'add_waitlistentry'),(178,'Can change waitlist entry',45,'change_waitlistentry'),(179,'Can delete waitlist entry',45,'delete_waitlistentry'),(180,'Can view waitlist entry',45,'view_waitlistentry');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blackbox_eventblackboxreport`
--

DROP TABLE IF EXISTS `blackbox_eventblackboxreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blackbox_eventblackboxreport` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expected_attendees` int unsigned NOT NULL,
  `actual_attendees` int unsigned NOT NULL,
  `total_feedbacks` int unsigned NOT NULL,
  `average_rating` decimal(3,2) NOT NULL,
  `sentiment_positive` decimal(5,2) NOT NULL,
  `sentiment_neutral` decimal(5,2) NOT NULL,
  `sentiment_negative` decimal(5,2) NOT NULL,
  `success_factors` json NOT NULL,
  `problems_found` json NOT NULL,
  `recommendations` json NOT NULL,
  `category_stats` json NOT NULL,
  `generated_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  CONSTRAINT `blackbox_eventblackb_event_id_5ce3a90a_fk_events_ev` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `blackbox_eventblackboxreport_chk_1` CHECK ((`expected_attendees` >= 0)),
  CONSTRAINT `blackbox_eventblackboxreport_chk_2` CHECK ((`actual_attendees` >= 0)),
  CONSTRAINT `blackbox_eventblackboxreport_chk_3` CHECK ((`total_feedbacks` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blackbox_eventblackboxreport`
--

LOCK TABLES `blackbox_eventblackboxreport` WRITE;
/*!40000 ALTER TABLE `blackbox_eventblackboxreport` DISABLE KEYS */;
/*!40000 ALTER TABLE `blackbox_eventblackboxreport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blackbox_eventfeedback`
--

DROP TABLE IF EXISTS `blackbox_eventfeedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blackbox_eventfeedback` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rating` int unsigned NOT NULL,
  `positive_feedback` json NOT NULL,
  `problems` json NOT NULL,
  `suggestions` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blackbox_eventfeedback_event_id_user_id_8bf7096f_uniq` (`event_id`,`user_id`),
  KEY `blackbox_eventfeedback_user_id_4b82c76d_fk_accounts_user_id` (`user_id`),
  KEY `blackbox_ev_event_i_abb505_idx` (`event_id`,`rating`),
  CONSTRAINT `blackbox_eventfeedback_event_id_9c2ae34f_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `blackbox_eventfeedback_user_id_4b82c76d_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `blackbox_eventfeedback_chk_1` CHECK ((`rating` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blackbox_eventfeedback`
--

LOCK TABLES `blackbox_eventfeedback` WRITE;
/*!40000 ALTER TABLE `blackbox_eventfeedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `blackbox_eventfeedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_booking`
--

DROP TABLE IF EXISTS `bookings_booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_booking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `number_of_tickets` int unsigned NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  UNIQUE KEY `payment_id` (`payment_id`),
  KEY `bookings_bo_user_id_917bf5_idx` (`user_id`,`event_id`),
  KEY `bookings_bo_booking_8a7545_idx` (`booking_reference`),
  KEY `bookings_booking_event_id_8605427c_fk_events_event_id` (`event_id`),
  CONSTRAINT `bookings_booking_event_id_8605427c_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `bookings_booking_user_id_834dfc23_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `bookings_booking_chk_1` CHECK ((`number_of_tickets` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_booking`
--

LOCK TABLES `bookings_booking` WRITE;
/*!40000 ALTER TABLE `bookings_booking` DISABLE KEYS */;
INSERT INTO `bookings_booking` VALUES (15,3,7500.00,'CONFIRMED',NULL,'BKB4CECB1E','2026-07-18 08:07:13.545024','2026-07-18 08:07:13.545078',11,13),(16,2,1000.00,'CONFIRMED',NULL,'BK0A58D864','2026-07-18 08:07:13.570241','2026-07-18 08:07:13.570269',14,13),(17,1,8000.00,'CONFIRMED',NULL,'BKEDD4F4DB','2026-07-18 08:07:13.588916','2026-07-18 08:07:13.588943',17,13),(18,2,5000.00,'CONFIRMED',NULL,'BK34B4D64B','2026-07-18 08:07:13.604237','2026-07-18 08:07:13.604267',11,14),(19,1,5000.00,'CONFIRMED',NULL,'BKE60E2F3E','2026-07-18 08:07:13.623702','2026-07-18 08:07:13.623729',13,14),(20,4,6000.00,'CONFIRMED',NULL,'BK54BF8767','2026-07-18 08:07:13.639733','2026-07-18 08:07:13.639761',15,14),(21,2,9000.00,'CONFIRMED',NULL,'BK30F263B3','2026-07-18 08:07:13.666864','2026-07-18 08:07:13.666892',12,15),(22,1,500.00,'CONFIRMED',NULL,'BK0D42F2C7','2026-07-18 08:07:13.687349','2026-07-18 08:07:13.687379',14,15),(23,2,600.00,'CONFIRMED',NULL,'BK9BEFF16F','2026-07-18 08:07:13.702937','2026-07-18 08:07:13.703002',16,15),(24,1,2500.00,'CONFIRMED',NULL,'BK83E1BB72','2026-07-18 08:07:13.721749','2026-07-18 08:07:13.721776',11,16),(25,3,2400.00,'CONFIRMED',NULL,'BK12ACB769','2026-07-18 08:07:13.736196','2026-07-18 08:07:13.736228',18,16),(26,2,4000.00,'CONFIRMED',NULL,'BK3168553E','2026-07-18 08:07:13.758081','2026-07-18 08:07:13.758111',20,16),(27,1,3500.00,'PENDING',NULL,'BK14ECFFC1','2026-07-18 08:07:13.777352','2026-07-18 08:07:13.777380',19,13),(28,2,3000.00,'CANCELLED',NULL,'BKC9E8239E','2026-07-18 08:07:13.796040','2026-07-18 08:07:13.796071',15,14),(29,1,3500.00,'CANCELLED',NULL,'BK4FCF0E4A','2026-07-18 08:23:05.708402','2026-07-18 08:23:17.914476',19,13),(30,1,5000.00,'CONFIRMED',NULL,'BKA850933D','2026-07-18 10:34:09.018559','2026-07-18 10:34:09.018587',13,19),(31,1,5000.00,'CONFIRMED',NULL,'BKDDAC941D','2026-07-18 11:05:51.205339','2026-07-18 11:05:51.205382',13,20),(32,1,8000.00,'CONFIRMED',NULL,'BKA7A8294D','2026-07-18 11:17:48.915914','2026-07-18 11:17:48.915942',17,20),(33,1,5000.00,'CONFIRMED',NULL,'BK1885D190','2026-07-20 05:50:24.710450','2026-07-20 05:50:24.710983',13,19),(34,1,3500.00,'CONFIRMED',NULL,'BK53626B53','2026-07-20 06:05:54.317868','2026-07-20 06:05:54.319737',19,20),(35,1,5000.00,'CONFIRMED',NULL,'BK2CDCC1AA','2026-07-22 05:56:07.810032','2026-07-22 05:56:07.812804',13,22),(36,1,2500.00,'CONFIRMED','pay_TGTDkwtojNHZOI','BK516BCBD4','2026-07-22 07:21:23.664268','2026-07-22 07:44:43.580155',11,13),(37,1,4500.00,'CONFIRMED','pay_TGTPAU2aVgJPFI','BK5DA07AAB','2026-07-22 07:54:49.971206','2026-07-22 07:55:26.494070',12,13),(38,1,3500.00,'PENDING','order_TGTQ9xPBRCSF2r','BK4AC90292','2026-07-22 07:56:04.241535','2026-07-22 07:56:04.241582',19,13);
/*!40000 ALTER TABLE `bookings_booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_ticket`
--

DROP TABLE IF EXISTS `bookings_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_ticket` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) NOT NULL,
  `qr_code` varchar(100) DEFAULT NULL,
  `is_scanned` tinyint(1) NOT NULL,
  `scanned_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `booking_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `bookings_ticket_booking_id_1532e311_fk_bookings_booking_id` (`booking_id`),
  CONSTRAINT `bookings_ticket_booking_id_1532e311_fk_bookings_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings_booking` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_ticket`
--

LOCK TABLES `bookings_ticket` WRITE;
/*!40000 ALTER TABLE `bookings_ticket` DISABLE KEYS */;
INSERT INTO `bookings_ticket` VALUES (28,'BKB4CECB1ET1','',0,NULL,'2026-07-18 08:07:13.555176',15),(29,'BKB4CECB1ET2','',0,NULL,'2026-07-18 08:07:13.560727',15),(30,'BKB4CECB1ET3','',0,NULL,'2026-07-18 08:07:13.565373',15),(31,'BK0A58D864T1','',0,NULL,'2026-07-18 08:07:13.580170',16),(32,'BK0A58D864T2','',0,NULL,'2026-07-18 08:07:13.584565',16),(33,'BKEDD4F4DBT1','',0,NULL,'2026-07-18 08:07:13.600283',17),(34,'BK34B4D64BT1','',0,NULL,'2026-07-18 08:07:13.614438',18),(35,'BK34B4D64BT2','',0,NULL,'2026-07-18 08:07:13.619398',18),(36,'BKE60E2F3ET1','',0,NULL,'2026-07-18 08:07:13.635089',19),(37,'BK54BF8767T1','',0,NULL,'2026-07-18 08:07:13.649332',20),(38,'BK54BF8767T2','',0,NULL,'2026-07-18 08:07:13.653794',20),(39,'BK54BF8767T3','',0,NULL,'2026-07-18 08:07:13.657972',20),(40,'BK54BF8767T4','',0,NULL,'2026-07-18 08:07:13.662659',20),(41,'BK30F263B3T1','',0,NULL,'2026-07-18 08:07:13.677745',21),(42,'BK30F263B3T2','',0,NULL,'2026-07-18 08:07:13.682598',21),(43,'BK0D42F2C7T1','',0,NULL,'2026-07-18 08:07:13.697974',22),(44,'BK9BEFF16FT1','',0,NULL,'2026-07-18 08:07:13.712741',23),(45,'BK9BEFF16FT2','',0,NULL,'2026-07-18 08:07:13.717379',23),(46,'BK83E1BB72T1','',0,NULL,'2026-07-18 08:07:13.731741',24),(47,'BK12ACB769T1','',0,NULL,'2026-07-18 08:07:13.746009',25),(48,'BK12ACB769T2','',0,NULL,'2026-07-18 08:07:13.750880',25),(49,'BK12ACB769T3','',0,NULL,'2026-07-18 08:07:13.754363',25),(50,'BK3168553ET1','',0,NULL,'2026-07-18 08:07:13.768076',26),(51,'BK3168553ET2','',0,NULL,'2026-07-18 08:07:13.772706',26),(52,'BK14ECFFC1T1','',0,NULL,'2026-07-18 08:07:13.791039',27),(53,'BKC9E8239ET1','',0,NULL,'2026-07-18 08:07:13.806202',28),(54,'BKC9E8239ET2','',0,NULL,'2026-07-18 08:07:13.810076',28),(55,'BK4FCF0E4AT1','',0,NULL,'2026-07-18 08:23:05.718040',29),(56,'BKA850933DT1','qrcodes/qr_BKA850933DT1.png',0,NULL,'2026-07-18 10:34:09.033933',30),(57,'BKDDAC941DT1','',0,NULL,'2026-07-18 11:05:51.215358',31),(58,'BKA7A8294DT1','',0,NULL,'2026-07-18 11:17:48.922123',32),(59,'BK1885D190T1','qrcodes/qr_BK1885D190T1.png',0,NULL,'2026-07-20 05:50:24.780280',33),(60,'BK53626B53T1','qrcodes/qr_BK53626B53T1.png',0,NULL,'2026-07-20 06:05:54.341625',34),(61,'BK2CDCC1AAT1','qrcodes/qr_BK2CDCC1AAT1.png',0,NULL,'2026-07-22 05:56:07.880350',35),(62,'BK516BCBD4T1','qrcodes/qr_BK516BCBD4T1.png',0,NULL,'2026-07-22 07:44:43.638453',36),(63,'BK5DA07AABT1','qrcodes/qr_BK5DA07AABT1.png',0,NULL,'2026-07-22 07:55:26.515352',37);
/*!40000 ALTER TABLE `bookings_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_waitlistentry`
--

DROP TABLE IF EXISTS `bookings_waitlistentry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_waitlistentry` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` varchar(20) NOT NULL,
  `position` int unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_waitlistentry_event_id_user_id_ea1ddc82_uniq` (`event_id`,`user_id`),
  KEY `bookings_waitlistentry_user_id_95b22ae0_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `bookings_waitlistentry_event_id_c52a5b8f_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `bookings_waitlistentry_user_id_95b22ae0_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `bookings_waitlistentry_chk_1` CHECK ((`position` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_waitlistentry`
--

LOCK TABLES `bookings_waitlistentry` WRITE;
/*!40000 ALTER TABLE `bookings_waitlistentry` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings_waitlistentry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_chatmessage`
--

DROP TABLE IF EXISTS `chat_chatmessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_chatmessage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `message` longtext NOT NULL,
  `attachment` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `chat_room_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_chatmessage_user_id_fa615e65_fk_accounts_user_id` (`user_id`),
  KEY `chat_chatme_chat_ro_81da8a_idx` (`chat_room_id`,`created_at`),
  CONSTRAINT `chat_chatmessage_chat_room_id_b69ca863_fk_chat_chatroom_id` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_chatroom` (`id`),
  CONSTRAINT `chat_chatmessage_user_id_fa615e65_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_chatmessage`
--

LOCK TABLES `chat_chatmessage` WRITE;
/*!40000 ALTER TABLE `chat_chatmessage` DISABLE KEYS */;
INSERT INTO `chat_chatmessage` VALUES (1,'hi','','2026-07-18 11:02:54.413061','2026-07-18 11:02:54.413088',19,2),(2,'hello','','2026-07-18 11:04:36.862991','2026-07-18 11:04:36.863017',20,2),(3,'hi','','2026-07-18 11:06:06.974367','2026-07-18 11:06:06.974397',19,2),(4,'broo','','2026-07-18 11:06:16.575305','2026-07-18 11:06:16.575354',20,2),(5,'hlo','','2026-07-18 11:14:05.398273','2026-07-18 11:14:05.398309',19,2),(6,'how r u','','2026-07-18 11:16:04.607914','2026-07-18 11:16:04.607944',19,2);
/*!40000 ALTER TABLE `chat_chatmessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_chatroom`
--

DROP TABLE IF EXISTS `chat_chatroom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_chatroom` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  CONSTRAINT `chat_chatroom_event_id_adf79ae4_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_chatroom`
--

LOCK TABLES `chat_chatroom` WRITE;
/*!40000 ALTER TABLE `chat_chatroom` DISABLE KEYS */;
INSERT INTO `chat_chatroom` VALUES (1,'2026-07-18 11:02:13.411985','2026-07-18 11:02:13.412020',11),(2,'2026-07-18 11:02:40.201443','2026-07-18 11:02:40.201474',13),(3,'2026-07-18 11:14:40.384150','2026-07-18 11:14:40.384177',12),(4,'2026-07-18 11:18:01.585381','2026-07-18 11:18:01.585425',17),(6,'2026-07-22 07:57:23.051106','2026-07-22 07:57:23.051141',19);
/*!40000 ALTER TABLE `chat_chatroom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_chatroommember`
--

DROP TABLE IF EXISTS `chat_chatroommember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_chatroommember` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `joined_at` datetime(6) NOT NULL,
  `last_seen` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `chat_room_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_chatroommember_chat_room_id_user_id_37d30323_uniq` (`chat_room_id`,`user_id`),
  KEY `chat_chatroommember_user_id_a585b158_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `chat_chatroommember_chat_room_id_4cbfa955_fk_chat_chatroom_id` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_chatroom` (`id`),
  CONSTRAINT `chat_chatroommember_user_id_a585b158_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_chatroommember`
--

LOCK TABLES `chat_chatroommember` WRITE;
/*!40000 ALTER TABLE `chat_chatroommember` DISABLE KEYS */;
INSERT INTO `chat_chatroommember` VALUES (1,'2026-07-18 11:02:13.451693','2026-07-18 11:02:27.241316',0,1,19),(2,'2026-07-18 11:02:40.212900','2026-07-20 05:52:03.785088',0,2,19),(3,'2026-07-18 11:04:16.250154','2026-07-18 11:17:22.892440',0,2,20),(4,'2026-07-18 11:14:40.393848','2026-07-18 11:15:34.722916',0,3,20),(5,'2026-07-18 11:18:01.595112','2026-07-18 11:18:05.205290',0,4,20),(6,'2026-07-20 04:22:24.965461','2026-07-20 04:22:24.965488',1,4,19),(8,'2026-07-22 06:52:41.443909','2026-07-22 06:52:41.444355',1,2,22),(9,'2026-07-22 07:57:23.064196','2026-07-22 07:57:23.064227',1,6,13);
/*!40000 ALTER TABLE `chat_chatroommember` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_eventexperience`
--

DROP TABLE IF EXISTS `community_eventexperience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_eventexperience` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `rating` int unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `likes_count` int unsigned NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `community_eventexperience_user_id_event_id_e3da2707_uniq` (`user_id`,`event_id`),
  KEY `community_e_event_i_74e437_idx` (`event_id`,`created_at` DESC),
  CONSTRAINT `community_eventexperience_event_id_2dd71f75_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `community_eventexperience_user_id_b19ceeeb_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `community_eventexperience_chk_1` CHECK ((`rating` >= 0)),
  CONSTRAINT `community_eventexperience_chk_2` CHECK ((`likes_count` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_eventexperience`
--

LOCK TABLES `community_eventexperience` WRITE;
/*!40000 ALTER TABLE `community_eventexperience` DISABLE KEYS */;
INSERT INTO `community_eventexperience` VALUES (6,'Incredible networking opportunity!','Startup India Summit was a game-changer. Met amazing founders and got valuable feedback on our product. The pitch competition was fierce and inspiring.',5,'2026-07-18 08:07:13.814569','2026-07-18 08:07:13.814623',0,17,13),(7,'Well organized event','Great speakers and well-organized panels. The investor networking dinner was the highlight. Would definitely attend next year.',4,'2026-07-18 08:07:13.819964','2026-07-18 08:07:13.819991',0,17,14),(8,'Good but could be better','Enjoyed the startup pitches but some sessions were too crowded. Great food and venue though. Overall a solid experience.',3,'2026-07-18 08:07:13.825561','2026-07-18 08:07:13.825601',0,17,15),(9,'Beautiful art showcase','The Rangoli Art Exhibition was stunning. The mix of traditional and modern art was refreshing. The interactive installations were the best part.',5,'2026-07-18 08:07:13.831298','2026-07-18 08:07:13.831329',0,16,13),(10,'A visual feast!','Spent 3 hours here and still didn\'t see everything. The contemporary section was my favorite. Highly recommend for art lovers.',4,'2026-07-18 08:07:13.835428','2026-07-18 08:07:13.835467',0,16,16),(11,'veryyyy wonderfulllll','it was a nice experience',4,'2026-07-18 11:19:00.356186','2026-07-18 11:19:00.356213',0,17,20),(12,'blooo','fcuyuoip',5,'2026-07-20 05:51:17.091530','2026-07-20 05:51:17.091563',0,13,19);
/*!40000 ALTER TABLE `community_eventexperience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_experiencecomment`
--

DROP TABLE IF EXISTS `community_experiencecomment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_experiencecomment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `experience_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `community_e_experie_685944_idx` (`experience_id`,`created_at`),
  KEY `community_experiencecomment_user_id_cef707fd_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `community_experience_experience_id_79179e16_fk_community` FOREIGN KEY (`experience_id`) REFERENCES `community_eventexperience` (`id`),
  CONSTRAINT `community_experiencecomment_user_id_cef707fd_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_experiencecomment`
--

LOCK TABLES `community_experiencecomment` WRITE;
/*!40000 ALTER TABLE `community_experiencecomment` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_experiencecomment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_experienceimage`
--

DROP TABLE IF EXISTS `community_experienceimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_experienceimage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(100) NOT NULL,
  `caption` varchar(500) NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `experience_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `community_experience_experience_id_93adb5f6_fk_community` (`experience_id`),
  CONSTRAINT `community_experience_experience_id_93adb5f6_fk_community` FOREIGN KEY (`experience_id`) REFERENCES `community_eventexperience` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_experienceimage`
--

LOCK TABLES `community_experienceimage` WRITE;
/*!40000 ALTER TABLE `community_experienceimage` DISABLE KEYS */;
INSERT INTO `community_experienceimage` VALUES (1,'experience_images/press-button.png','','2026-07-20 05:51:17.110430',12);
/*!40000 ALTER TABLE `community_experienceimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_experiencelike`
--

DROP TABLE IF EXISTS `community_experiencelike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_experiencelike` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `experience_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `community_experiencelike_experience_id_user_id_22279012_uniq` (`experience_id`,`user_id`),
  KEY `community_experiencelike_user_id_07bd07e9_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `community_experience_experience_id_77149a0c_fk_community` FOREIGN KEY (`experience_id`) REFERENCES `community_eventexperience` (`id`),
  CONSTRAINT `community_experiencelike_user_id_07bd07e9_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_experiencelike`
--

LOCK TABLES `community_experiencelike` WRITE;
/*!40000 ALTER TABLE `community_experiencelike` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_experiencelike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_beat_clockedschedule`
--

DROP TABLE IF EXISTS `django_celery_beat_clockedschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_beat_clockedschedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clocked_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_beat_clockedschedule`
--

LOCK TABLES `django_celery_beat_clockedschedule` WRITE;
/*!40000 ALTER TABLE `django_celery_beat_clockedschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_beat_clockedschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_beat_crontabschedule`
--

DROP TABLE IF EXISTS `django_celery_beat_crontabschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_beat_crontabschedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `minute` varchar(240) NOT NULL,
  `hour` varchar(96) NOT NULL,
  `day_of_week` varchar(64) NOT NULL,
  `day_of_month` varchar(124) NOT NULL,
  `month_of_year` varchar(64) NOT NULL,
  `timezone` varchar(63) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_beat_crontabschedule`
--

LOCK TABLES `django_celery_beat_crontabschedule` WRITE;
/*!40000 ALTER TABLE `django_celery_beat_crontabschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_beat_crontabschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_beat_intervalschedule`
--

DROP TABLE IF EXISTS `django_celery_beat_intervalschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_beat_intervalschedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `every` int NOT NULL,
  `period` varchar(24) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_beat_intervalschedule`
--

LOCK TABLES `django_celery_beat_intervalschedule` WRITE;
/*!40000 ALTER TABLE `django_celery_beat_intervalschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_beat_intervalschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_beat_periodictask`
--

DROP TABLE IF EXISTS `django_celery_beat_periodictask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_beat_periodictask` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `task` varchar(200) NOT NULL,
  `args` longtext NOT NULL,
  `kwargs` longtext NOT NULL,
  `queue` varchar(200) DEFAULT NULL,
  `exchange` varchar(200) DEFAULT NULL,
  `routing_key` varchar(200) DEFAULT NULL,
  `expires` datetime(6) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL,
  `last_run_at` datetime(6) DEFAULT NULL,
  `total_run_count` int unsigned NOT NULL,
  `date_changed` datetime(6) NOT NULL,
  `description` longtext NOT NULL,
  `crontab_id` int DEFAULT NULL,
  `interval_id` int DEFAULT NULL,
  `solar_id` int DEFAULT NULL,
  `one_off` tinyint(1) NOT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `priority` int unsigned DEFAULT NULL,
  `headers` longtext NOT NULL DEFAULT (_utf8mb4'{}'),
  `clocked_id` int DEFAULT NULL,
  `expire_seconds` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `django_celery_beat_p_crontab_id_d3cba168_fk_django_ce` (`crontab_id`),
  KEY `django_celery_beat_p_interval_id_a8ca27da_fk_django_ce` (`interval_id`),
  KEY `django_celery_beat_p_solar_id_a87ce72c_fk_django_ce` (`solar_id`),
  KEY `django_celery_beat_p_clocked_id_47a69f82_fk_django_ce` (`clocked_id`),
  CONSTRAINT `django_celery_beat_p_clocked_id_47a69f82_fk_django_ce` FOREIGN KEY (`clocked_id`) REFERENCES `django_celery_beat_clockedschedule` (`id`),
  CONSTRAINT `django_celery_beat_p_crontab_id_d3cba168_fk_django_ce` FOREIGN KEY (`crontab_id`) REFERENCES `django_celery_beat_crontabschedule` (`id`),
  CONSTRAINT `django_celery_beat_p_interval_id_a8ca27da_fk_django_ce` FOREIGN KEY (`interval_id`) REFERENCES `django_celery_beat_intervalschedule` (`id`),
  CONSTRAINT `django_celery_beat_p_solar_id_a87ce72c_fk_django_ce` FOREIGN KEY (`solar_id`) REFERENCES `django_celery_beat_solarschedule` (`id`),
  CONSTRAINT `django_celery_beat_periodictask_chk_1` CHECK ((`total_run_count` >= 0)),
  CONSTRAINT `django_celery_beat_periodictask_chk_2` CHECK ((`priority` >= 0)),
  CONSTRAINT `django_celery_beat_periodictask_chk_3` CHECK ((`expire_seconds` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_beat_periodictask`
--

LOCK TABLES `django_celery_beat_periodictask` WRITE;
/*!40000 ALTER TABLE `django_celery_beat_periodictask` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_beat_periodictask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_beat_periodictasks`
--

DROP TABLE IF EXISTS `django_celery_beat_periodictasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_beat_periodictasks` (
  `ident` smallint NOT NULL,
  `last_update` datetime(6) NOT NULL,
  PRIMARY KEY (`ident`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_beat_periodictasks`
--

LOCK TABLES `django_celery_beat_periodictasks` WRITE;
/*!40000 ALTER TABLE `django_celery_beat_periodictasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_beat_periodictasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_beat_solarschedule`
--

DROP TABLE IF EXISTS `django_celery_beat_solarschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_beat_solarschedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event` varchar(24) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq` (`event`,`latitude`,`longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_beat_solarschedule`
--

LOCK TABLES `django_celery_beat_solarschedule` WRITE;
/*!40000 ALTER TABLE `django_celery_beat_solarschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_beat_solarschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_results_chordcounter`
--

DROP TABLE IF EXISTS `django_celery_results_chordcounter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_results_chordcounter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` varchar(255) NOT NULL,
  `sub_tasks` longtext NOT NULL,
  `count` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`),
  CONSTRAINT `django_celery_results_chordcounter_chk_1` CHECK ((`count` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_results_chordcounter`
--

LOCK TABLES `django_celery_results_chordcounter` WRITE;
/*!40000 ALTER TABLE `django_celery_results_chordcounter` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_results_chordcounter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_results_groupresult`
--

DROP TABLE IF EXISTS `django_celery_results_groupresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_results_groupresult` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` varchar(255) NOT NULL,
  `date_created` datetime(6) NOT NULL,
  `date_done` datetime(6) NOT NULL,
  `content_type` varchar(128) NOT NULL,
  `content_encoding` varchar(64) NOT NULL,
  `result` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`),
  KEY `django_cele_date_cr_bd6c1d_idx` (`date_created`),
  KEY `django_cele_date_do_caae0e_idx` (`date_done`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_results_groupresult`
--

LOCK TABLES `django_celery_results_groupresult` WRITE;
/*!40000 ALTER TABLE `django_celery_results_groupresult` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_results_groupresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_celery_results_taskresult`
--

DROP TABLE IF EXISTS `django_celery_results_taskresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_celery_results_taskresult` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `content_type` varchar(128) NOT NULL,
  `content_encoding` varchar(64) NOT NULL,
  `result` longtext,
  `date_done` datetime(6) NOT NULL,
  `traceback` longtext,
  `meta` longtext,
  `task_args` longtext,
  `task_kwargs` longtext,
  `task_name` varchar(255) DEFAULT NULL,
  `worker` varchar(100) DEFAULT NULL,
  `date_created` datetime(6) NOT NULL,
  `periodic_task_name` varchar(255) DEFAULT NULL,
  `date_started` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_id` (`task_id`),
  KEY `django_cele_task_na_08aec9_idx` (`task_name`),
  KEY `django_cele_status_9b6201_idx` (`status`),
  KEY `django_cele_worker_d54dd8_idx` (`worker`),
  KEY `django_cele_date_cr_f04a50_idx` (`date_created`),
  KEY `django_cele_date_do_f59aad_idx` (`date_done`),
  KEY `django_cele_periodi_1993cf_idx` (`periodic_task_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_celery_results_taskresult`
--

LOCK TABLES `django_celery_results_taskresult` WRITE;
/*!40000 ALTER TABLE `django_celery_results_taskresult` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_celery_results_taskresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (19,'accounts','organizerprofile'),(36,'accounts','profileeditrequest'),(20,'accounts','user'),(1,'admin','logentry'),(37,'auctions','eventbid'),(38,'auctions','eventrequest'),(39,'auctions','eventrequestcomment'),(40,'auctions','eventrequestsupport'),(2,'auth','group'),(3,'auth','permission'),(6,'authtoken','token'),(7,'authtoken','tokenproxy'),(41,'blackbox','eventblackboxreport'),(42,'blackbox','eventfeedback'),(24,'bookings','booking'),(25,'bookings','ticket'),(45,'bookings','waitlistentry'),(30,'chat','chatmessage'),(31,'chat','chatroom'),(32,'chat','chatroommember'),(26,'community','eventexperience'),(27,'community','experiencecomment'),(28,'community','experienceimage'),(29,'community','experiencelike'),(4,'contenttypes','contenttype'),(10,'django_celery_beat','clockedschedule'),(11,'django_celery_beat','crontabschedule'),(12,'django_celery_beat','intervalschedule'),(13,'django_celery_beat','periodictask'),(14,'django_celery_beat','periodictasks'),(15,'django_celery_beat','solarschedule'),(16,'django_celery_results','chordcounter'),(17,'django_celery_results','groupresult'),(18,'django_celery_results','taskresult'),(21,'events','category'),(22,'events','event'),(23,'events','eventimage'),(43,'events','participantrequest'),(44,'events','participantresponse'),(33,'notifications_app','emailnotification'),(34,'notifications_app','notification'),(35,'notifications_app','smsnotification'),(5,'sessions','session'),(8,'token_blacklist','blacklistedtoken'),(9,'token_blacklist','outstandingtoken');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-07-18 04:50:39.732899'),(2,'contenttypes','0002_remove_content_type_name','2026-07-18 04:50:39.958921'),(3,'auth','0001_initial','2026-07-18 04:50:40.964875'),(4,'auth','0002_alter_permission_name_max_length','2026-07-18 04:50:41.088757'),(5,'auth','0003_alter_user_email_max_length','2026-07-18 04:50:41.101984'),(6,'auth','0004_alter_user_username_opts','2026-07-18 04:50:41.115459'),(7,'auth','0005_alter_user_last_login_null','2026-07-18 04:50:41.126692'),(8,'auth','0006_require_contenttypes_0002','2026-07-18 04:50:41.134995'),(9,'auth','0007_alter_validators_add_error_messages','2026-07-18 04:50:41.147053'),(10,'auth','0008_alter_user_username_max_length','2026-07-18 04:50:41.156199'),(11,'auth','0009_alter_user_last_name_max_length','2026-07-18 04:50:41.165878'),(12,'auth','0010_alter_group_name_max_length','2026-07-18 04:50:41.188122'),(13,'auth','0011_update_proxy_permissions','2026-07-18 04:50:41.198576'),(14,'auth','0012_alter_user_first_name_max_length','2026-07-18 04:50:41.208598'),(15,'accounts','0001_initial','2026-07-18 04:50:41.883451'),(16,'admin','0001_initial','2026-07-18 04:50:42.111482'),(17,'admin','0002_logentry_remove_auto_add','2026-07-18 04:50:42.126162'),(18,'admin','0003_logentry_add_action_flag_choices','2026-07-18 04:50:42.151634'),(19,'authtoken','0001_initial','2026-07-18 04:50:42.296671'),(20,'authtoken','0002_auto_20160226_1747','2026-07-18 04:50:42.344980'),(21,'authtoken','0003_tokenproxy','2026-07-18 04:50:42.349676'),(22,'authtoken','0004_alter_tokenproxy_options','2026-07-18 04:50:42.358857'),(23,'django_celery_beat','0001_initial','2026-07-18 04:50:42.730089'),(24,'django_celery_beat','0002_auto_20161118_0346','2026-07-18 04:50:42.896292'),(25,'django_celery_beat','0003_auto_20161209_0049','2026-07-18 04:50:42.929601'),(26,'django_celery_beat','0004_auto_20170221_0000','2026-07-18 04:50:42.936814'),(27,'django_celery_beat','0005_add_solarschedule_events_choices','2026-07-18 04:50:42.954442'),(28,'django_celery_beat','0006_auto_20180322_0932','2026-07-18 04:50:43.151589'),(29,'django_celery_beat','0007_auto_20180521_0826','2026-07-18 04:50:43.374761'),(30,'django_celery_beat','0008_auto_20180914_1922','2026-07-18 04:50:43.421523'),(31,'django_celery_beat','0006_auto_20180210_1226','2026-07-18 04:50:43.467681'),(32,'django_celery_beat','0006_periodictask_priority','2026-07-18 04:50:43.588056'),(33,'django_celery_beat','0009_periodictask_headers','2026-07-18 04:50:43.711252'),(34,'django_celery_beat','0010_auto_20190429_0326','2026-07-18 04:50:43.956237'),(35,'django_celery_beat','0011_auto_20190508_0153','2026-07-18 04:50:44.186415'),(36,'django_celery_beat','0012_periodictask_expire_seconds','2026-07-18 04:50:44.299435'),(37,'django_celery_beat','0013_auto_20200609_0727','2026-07-18 04:50:44.313896'),(38,'django_celery_beat','0014_remove_clockedschedule_enabled','2026-07-18 04:50:44.376180'),(39,'django_celery_beat','0015_edit_solarschedule_events_choices','2026-07-18 04:50:44.384008'),(40,'django_celery_beat','0016_alter_crontabschedule_timezone','2026-07-18 04:50:44.400824'),(41,'django_celery_beat','0017_alter_crontabschedule_month_of_year','2026-07-18 04:50:44.413200'),(42,'django_celery_beat','0018_improve_crontab_helptext','2026-07-18 04:50:44.436668'),(43,'django_celery_beat','0019_alter_periodictasks_options','2026-07-18 04:50:44.441941'),(44,'django_celery_results','0001_initial','2026-07-18 04:50:44.538933'),(45,'django_celery_results','0002_add_task_name_args_kwargs','2026-07-18 04:50:44.800040'),(46,'django_celery_results','0003_auto_20181106_1101','2026-07-18 04:50:44.805052'),(47,'django_celery_results','0004_auto_20190516_0412','2026-07-18 04:50:44.901898'),(48,'django_celery_results','0005_taskresult_worker','2026-07-18 04:50:45.026891'),(49,'django_celery_results','0006_taskresult_date_created','2026-07-18 04:50:45.191892'),(50,'django_celery_results','0007_remove_taskresult_hidden','2026-07-18 04:50:45.284995'),(51,'django_celery_results','0008_chordcounter','2026-07-18 04:50:45.328235'),(52,'django_celery_results','0009_groupresult','2026-07-18 04:50:45.718125'),(53,'django_celery_results','0010_remove_duplicate_indices','2026-07-18 04:50:45.731706'),(54,'django_celery_results','0011_taskresult_periodic_task_name','2026-07-18 04:50:45.831761'),(55,'django_celery_results','0012_taskresult_date_started','2026-07-18 04:50:46.069243'),(56,'django_celery_results','0013_taskresult_django_cele_periodi_1993cf_idx','2026-07-18 04:50:46.103244'),(57,'django_celery_results','0014_alter_taskresult_status','2026-07-18 04:50:46.109765'),(58,'sessions','0001_initial','2026-07-18 04:50:46.165899'),(59,'token_blacklist','0001_initial','2026-07-18 04:50:46.458455'),(60,'token_blacklist','0002_outstandingtoken_jti_hex','2026-07-18 04:50:46.563051'),(61,'token_blacklist','0003_auto_20171017_2007','2026-07-18 04:50:46.603714'),(62,'token_blacklist','0004_auto_20171017_2013','2026-07-18 04:50:46.719097'),(63,'token_blacklist','0005_remove_outstandingtoken_jti','2026-07-18 04:50:46.816994'),(64,'token_blacklist','0006_auto_20171017_2113','2026-07-18 04:50:46.854603'),(65,'token_blacklist','0007_auto_20171017_2214','2026-07-18 04:50:47.130418'),(66,'token_blacklist','0008_migrate_to_bigautofield','2026-07-18 04:50:47.587773'),(67,'token_blacklist','0010_fix_migrate_to_bigautofield','2026-07-18 04:50:47.621700'),(68,'token_blacklist','0011_linearizes_history','2026-07-18 04:50:47.624934'),(69,'token_blacklist','0012_alter_outstandingtoken_user','2026-07-18 04:50:47.642257'),(70,'token_blacklist','0013_alter_blacklistedtoken_options_and_more','2026-07-18 04:50:47.720771'),(71,'events','0001_initial','2026-07-18 05:35:12.507877'),(72,'bookings','0001_initial','2026-07-18 06:45:52.547258'),(73,'chat','0001_initial','2026-07-18 06:45:53.261301'),(74,'community','0001_initial','2026-07-18 06:45:54.343698'),(75,'notifications_app','0001_initial','2026-07-18 06:45:55.286542'),(76,'accounts','0002_alter_user_phone_number','2026-07-18 09:27:06.272523'),(77,'events','0002_alter_event_status','2026-07-20 06:04:48.673010'),(78,'notifications_app','0002_alter_notification_notification_type','2026-07-20 06:33:00.391813'),(79,'accounts','0003_profileeditrequest','2026-07-22 06:41:49.324158'),(80,'auctions','0001_initial','2026-07-29 12:11:27.806289'),(81,'auctions','0002_make_preferred_location_optional','2026-07-29 12:11:27.825790'),(82,'blackbox','0001_initial','2026-07-29 12:11:28.155977'),(83,'events','0003_add_category_updated_at','2026-07-29 12:11:28.188446'),(84,'notifications_app','0003_alter_notification_notification_type','2026-07-29 12:11:28.209702'),(85,'events','0004_participantrequest_participantresponse','2026-07-29 12:28:17.571720'),(86,'events','0005_event_booking_deadline_event_certificate_available_and_more','2026-08-03 11:38:30.409492'),(87,'bookings','0002_alter_booking_status_waitlistentry','2026-08-03 11:38:30.653823'),(88,'notifications_app','0004_alter_notification_notification_type','2026-08-03 11:38:30.672103');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events_category`
--

DROP TABLE IF EXISTS `events_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `icon` varchar(100) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events_category`
--

LOCK TABLES `events_category` WRITE;
/*!40000 ALTER TABLE `events_category` DISABLE KEYS */;
INSERT INTO `events_category` VALUES (9,'Music','Live music concerts and performances','music_note','2026-07-18 08:07:03.265990','2026-07-29 12:11:28.160985'),(10,'Sports','Sports events and tournaments','sports_soccer','2026-07-18 08:07:03.271651','2026-07-29 12:11:28.160985'),(11,'Technology','Tech conferences and meetups','computer','2026-07-18 08:07:03.276341','2026-07-29 12:11:28.160985'),(12,'Food & Drink','Food festivals and culinary events','restaurant','2026-07-18 08:07:03.280255','2026-07-29 12:11:28.160985'),(13,'Art & Culture','Art exhibitions and cultural shows','palette','2026-07-18 08:07:03.285762','2026-07-29 12:11:28.160985'),(14,'Business','Business conferences and networking','business_center','2026-07-18 08:07:03.289319','2026-07-29 12:11:28.160985'),(15,'Health & Wellness','Yoga, fitness, and wellness events','fitness_center','2026-07-18 08:07:03.293081','2026-07-29 12:11:28.160985'),(16,'Education','Workshops, seminars, and courses','school','2026-07-18 08:07:03.297316','2026-07-29 12:11:28.160985');
/*!40000 ALTER TABLE `events_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events_event`
--

DROP TABLE IF EXISTS `events_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `venue` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `banner` varchar(100) NOT NULL,
  `ticket_price` decimal(10,2) NOT NULL,
  `total_seats` int unsigned NOT NULL,
  `available_seats` int unsigned NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint NOT NULL,
  `organizer_id` bigint NOT NULL,
  `booking_deadline` datetime(6) DEFAULT NULL,
  `certificate_available` tinyint(1) NOT NULL,
  `certificate_template` varchar(100) DEFAULT NULL,
  `charging_stations` tinyint(1) NOT NULL,
  `food_available` tinyint(1) NOT NULL,
  `food_details` varchar(255) NOT NULL,
  `language` varchar(200) NOT NULL,
  `parking_available` tinyint(1) NOT NULL,
  `parking_details` varchar(255) NOT NULL,
  `prayer_room` tinyint(1) NOT NULL,
  `restrooms_available` tinyint(1) NOT NULL,
  `water_refill_stations` tinyint(1) NOT NULL,
  `what_to_bring` longtext NOT NULL,
  `wheelchair_accessible` tinyint(1) NOT NULL,
  `wifi_available` tinyint(1) NOT NULL,
  `wifi_details` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `events_event_category_id_01d3a3ab_fk_events_category_id` (`category_id`),
  KEY `events_event_organizer_id_3afa7809_fk_accounts_user_id` (`organizer_id`),
  CONSTRAINT `events_event_category_id_01d3a3ab_fk_events_category_id` FOREIGN KEY (`category_id`) REFERENCES `events_category` (`id`),
  CONSTRAINT `events_event_organizer_id_3afa7809_fk_accounts_user_id` FOREIGN KEY (`organizer_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `events_event_chk_1` CHECK ((`total_seats` >= 0)),
  CONSTRAINT `events_event_chk_2` CHECK ((`available_seats` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events_event`
--

LOCK TABLES `events_event` WRITE;
/*!40000 ALTER TABLE `events_event` DISABLE KEYS */;
INSERT INTO `events_event` VALUES (11,'Summer Music Festival 2026','Join us for an electrifying weekend of live music featuring top artists from around the country. Three stages, food trucks, and an unforgettable atmosphere.','Jawaharlal Nehru Stadium','Delhi',28.580900,77.233100,'2026-08-02','2026-08-04','16:00:00.000000','23:00:00.000000','event_banners/music_banner.jpg',2500.00,5000,4993,'UPCOMING','2026-07-18 08:07:04.288014','2026-07-22 07:44:45.114089',9,11,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(12,'Jazz Night Under the Stars','An intimate evening of smooth jazz under the open sky. Featuring renowned jazz musicians and a premium dining experience.','Royal Orchid Terrace','Mumbai',19.076000,72.877700,'2026-08-12','2026-08-12','19:00:00.000000','23:30:00.000000','event_banners/jazz_banner.jpg',4500.00,500,497,'UPCOMING','2026-07-18 08:07:05.054980','2026-07-22 07:55:26.574626',9,11,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(13,'TechSummit 2026 - AI & Beyond','India\'s premier technology conference exploring AI, machine learning, blockchain, and the future of tech. 50+ speakers, hands-on workshops, and networking opportunities.','Bangalore International Exhibition Centre','Bangalore',13.082700,77.587700,'2026-08-17','2026-08-19','09:00:00.000000','18:00:00.000000','event_banners/tech_banner.jpg',5000.00,2000,1995,'UPCOMING','2026-07-18 08:07:06.845419','2026-07-22 05:56:08.539156',11,12,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(14,'Street Food Carnival','Taste the best street food from across India! 100+ food stalls, live cooking shows, eating contests, and family-friendly activities.','MG Road Carnival Ground','Chennai',13.082700,80.270700,'2026-07-28','2026-07-30','11:00:00.000000','22:00:00.000000','event_banners/food_banner.jpg',500.00,10000,9997,'UPCOMING','2026-07-18 08:07:07.958521','2026-07-18 08:07:13.691859',12,12,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(15,'Champions Cricket League','Watch the most exciting T20 cricket action of the season. 8 teams compete for the championship trophy over 2 thrilling weeks.','Eden Gardens','Kolkata',22.564600,88.343300,'2026-07-23','2026-08-05','14:00:00.000000','22:00:00.000000','event_banners/cricket_banner.jpg',1500.00,60000,59994,'UPCOMING','2026-07-18 08:07:09.602762','2026-07-18 08:07:13.800643',10,11,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(16,'Rangoli Art Exhibition','A stunning exhibition of traditional and contemporary Indian art. Featuring 200+ artists and interactive art installations.','National Gallery of Modern Art','Mumbai',19.059600,72.829500,'2026-07-13','2026-07-28','10:00:00.000000','19:00:00.000000','event_banners/art_banner.jpg',300.00,1000,998,'ONGOING','2026-07-18 08:07:10.409175','2026-07-18 08:07:13.707057',13,12,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(17,'Startup India Summit','Connect with 500+ startup founders, investors, and industry leaders. Pitch competitions, panel discussions, and networking dinners.','Taj Palace Hotel','Delhi',28.613900,77.209000,'2026-06-28','2026-06-29','09:00:00.000000','18:00:00.000000','event_banners/startup_banner.jpg',8000.00,800,798,'COMPLETED','2026-07-18 08:07:10.966941','2026-07-18 11:17:48.928022',14,11,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(18,'Sunrise Yoga Festival','Start your day with peace and energy. Guided yoga sessions by world-class instructors, meditation workshops, and organic food stalls.','Marine Drive Promenade','Mumbai',18.943200,72.823400,'2026-07-21','2026-07-21','05:30:00.000000','09:00:00.000000','event_banners/yoga_banner.jpg',800.00,2000,1997,'UPCOMING','2026-07-18 08:07:12.412159','2026-07-18 08:07:13.740711',15,12,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(19,'Python Programming Bootcamp','3-day intensive Python bootcamp covering web development, data science, and automation. Hands-on projects and certification included.','IIT Bombay Convention Centre','Mumbai',19.133400,72.913300,'2026-08-07','2026-08-09','09:00:00.000000','17:00:00.000000','event_banners/python_banner.jpg',3500.00,200,198,'UPCOMING','2026-07-18 08:07:12.950158','2026-07-20 06:05:54.645941',16,11,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(20,'EDM Nights Bangalore','Experience the best electronic dance music party in Bangalore. International DJs, laser shows, and an electrifying atmosphere.','Phoenix Marketcity','Bangalore',12.998700,77.690600,'2026-07-25','2026-07-25','20:00:00.000000','02:00:00.000000','event_banners/edm_banner.jpg',2000.00,3000,2998,'UPCOMING','2026-07-18 08:07:13.540061','2026-07-18 08:07:13.762489',9,12,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,''),(21,'Biriyani challenge','fghrhrfh','kochi','malp',NULL,NULL,'2026-07-18','2026-07-25','19:01:00.000000','19:01:00.000000','event_banners/play-button-arrowhead.png',99.99,97,97,'UPCOMING','2026-07-18 10:32:30.496383','2026-07-18 10:32:30.496415',12,18,NULL,0,NULL,0,0,'','',0,'',0,0,0,'',0,0,'');
/*!40000 ALTER TABLE `events_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events_eventimage`
--

DROP TABLE IF EXISTS `events_eventimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_eventimage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(100) NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `events_eventimage_event_id_98f6f988_fk_events_event_id` (`event_id`),
  CONSTRAINT `events_eventimage_event_id_98f6f988_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events_eventimage`
--

LOCK TABLES `events_eventimage` WRITE;
/*!40000 ALTER TABLE `events_eventimage` DISABLE KEYS */;
/*!40000 ALTER TABLE `events_eventimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events_participantrequest`
--

DROP TABLE IF EXISTS `events_participantrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_participantrequest` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` longtext NOT NULL,
  `required_participants` int unsigned NOT NULL,
  `current_participants` int unsigned NOT NULL,
  `deadline` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `organizer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `events_participantrequest_event_id_269c1fc8_fk_events_event_id` (`event_id`),
  KEY `events_participantre_organizer_id_364e62e5_fk_accounts_` (`organizer_id`),
  CONSTRAINT `events_participantre_organizer_id_364e62e5_fk_accounts_` FOREIGN KEY (`organizer_id`) REFERENCES `accounts_user` (`id`),
  CONSTRAINT `events_participantrequest_event_id_269c1fc8_fk_events_event_id` FOREIGN KEY (`event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `events_participantrequest_chk_1` CHECK ((`required_participants` >= 0)),
  CONSTRAINT `events_participantrequest_chk_2` CHECK ((`current_participants` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events_participantrequest`
--

LOCK TABLES `events_participantrequest` WRITE;
/*!40000 ALTER TABLE `events_participantrequest` DISABLE KEYS */;
INSERT INTO `events_participantrequest` VALUES (1,'rhntry',300,0,'2026-07-31 12:35:00.000000','OPEN','2026-07-29 12:35:31.664442','2026-07-29 12:35:31.664475',18,12);
/*!40000 ALTER TABLE `events_participantrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events_participantresponse`
--

DROP TABLE IF EXISTS `events_participantresponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_participantresponse` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `message` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `participant_request_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_participantrespon_participant_request_id_u_85a6bf61_uniq` (`participant_request_id`,`user_id`),
  KEY `events_participantresponse_user_id_b4d65d62_fk_accounts_user_id` (`user_id`),
  CONSTRAINT `events_participantre_participant_request__49273ca6_fk_events_pa` FOREIGN KEY (`participant_request_id`) REFERENCES `events_participantrequest` (`id`),
  CONSTRAINT `events_participantresponse_user_id_b4d65d62_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events_participantresponse`
--

LOCK TABLES `events_participantresponse` WRITE;
/*!40000 ALTER TABLE `events_participantresponse` DISABLE KEYS */;
/*!40000 ALTER TABLE `events_participantresponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_app_emailnotification`
--

DROP TABLE IF EXISTS `notifications_app_emailnotification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications_app_emailnotification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(254) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `error_message` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `notification_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_id` (`notification_id`),
  KEY `notificatio_status_eb8329_idx` (`status`,`created_at`),
  CONSTRAINT `notifications_app_em_notification_id_16736572_fk_notificat` FOREIGN KEY (`notification_id`) REFERENCES `notifications_app_notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_app_emailnotification`
--

LOCK TABLES `notifications_app_emailnotification` WRITE;
/*!40000 ALTER TABLE `notifications_app_emailnotification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications_app_emailnotification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_app_notification`
--

DROP TABLE IF EXISTS `notifications_app_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications_app_notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notification_type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` longtext NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `related_booking_id` bigint DEFAULT NULL,
  `related_event_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notificatio_user_id_f4dcde_idx` (`user_id`,`created_at` DESC),
  KEY `notificatio_is_read_bf90e1_idx` (`is_read`,`user_id`),
  KEY `notifications_app_no_related_booking_id_94eaadc2_fk_bookings_` (`related_booking_id`),
  KEY `notifications_app_no_related_event_id_e0e603d0_fk_events_ev` (`related_event_id`),
  CONSTRAINT `notifications_app_no_related_booking_id_94eaadc2_fk_bookings_` FOREIGN KEY (`related_booking_id`) REFERENCES `bookings_booking` (`id`),
  CONSTRAINT `notifications_app_no_related_event_id_e0e603d0_fk_events_ev` FOREIGN KEY (`related_event_id`) REFERENCES `events_event` (`id`),
  CONSTRAINT `notifications_app_no_user_id_9d8bad78_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_app_notification`
--

LOCK TABLES `notifications_app_notification` WRITE;
/*!40000 ALTER TABLE `notifications_app_notification` DISABLE KEYS */;
INSERT INTO `notifications_app_notification` VALUES (6,'BOOKING_CONFIRMATION','Booking Confirmed','Your booking for Summer Music Festival 2026 has been confirmed!',0,NULL,'2026-07-18 08:07:13.840095',NULL,11,13),(7,'EVENT_UPDATE','Event Update','Startup India Summit has been completed. Share your experience!',0,NULL,'2026-07-18 08:07:13.846306',NULL,17,13),(8,'BOOKING_CONFIRMATION','Booking Confirmed','Your booking for TechSummit 2026 - AI & Beyond is confirmed!',0,NULL,'2026-07-18 08:07:13.852460',NULL,13,14),(9,'BOOKING_REMINDER','Event Reminder','Sunrise Yoga Festival is starting in 3 days!',0,NULL,'2026-07-18 08:07:13.858755',NULL,18,16),(10,'ORGANIZER_APPROVAL','Account Approved','Your organizer account has been approved!',1,'2026-07-20 06:34:01.437473','2026-07-18 08:07:13.864262',NULL,NULL,11),(16,'PROFILE_EDIT_APPROVED','Profile Changes Approved','Your profile changes have been approved and applied.',0,NULL,'2026-07-22 06:43:34.636834',NULL,NULL,22),(17,'PROFILE_EDIT_APPROVED','Profile Changes Approved','Your profile changes have been approved and applied.',0,NULL,'2026-07-22 06:56:19.699804',NULL,NULL,11),(18,'PROFILE_EDIT_REQUEST','Profile Edit Request','Rahul (ORGANIZER) requested changes to: last_name',1,'2026-07-22 06:56:47.450872','2026-07-22 06:56:37.662919',NULL,NULL,10),(19,'PROFILE_EDIT_APPROVED','Profile Changes Approved','Your profile changes have been approved and applied.',0,NULL,'2026-07-22 06:57:10.868147',NULL,NULL,11),(20,'PROFILE_EDIT_REQUEST','Profile Edit Request','Rahul (ORGANIZER) requested changes to: last_name, address',1,'2026-07-22 06:57:28.329985','2026-07-22 06:57:20.507743',NULL,NULL,10),(21,'PROFILE_EDIT_APPROVED','Profile Changes Approved','Your profile changes have been approved and applied.',0,NULL,'2026-07-22 06:57:52.041496',NULL,NULL,11),(22,'PROFILE_EDIT_REQUEST','Profile Edit Request','Rahul (ORGANIZER) requested changes to: first_name, last_name, address',1,'2026-07-22 07:00:52.432028','2026-07-22 07:00:25.029020',NULL,NULL,10),(23,'PROFILE_EDIT_REQUEST','Profile Edit Request','John (USER) requested changes to: last_name',1,'2026-07-22 07:00:51.642779','2026-07-22 07:00:38.236372',NULL,NULL,10),(24,'PROFILE_EDIT_APPROVED','Profile Changes Approved','Your profile changes have been approved and applied.',0,NULL,'2026-07-22 07:02:39.886781',NULL,NULL,11),(25,'PROFILE_EDIT_APPROVED','Profile Changes Approved','Your profile changes have been approved and applied.',0,NULL,'2026-07-22 07:02:49.754338',NULL,NULL,22);
/*!40000 ALTER TABLE `notifications_app_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_app_smsnotification`
--

DROP TABLE IF EXISTS `notifications_app_smsnotification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications_app_smsnotification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `phone_number` varchar(15) NOT NULL,
  `message` varchar(160) NOT NULL,
  `status` varchar(20) NOT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_message_id` varchar(255) NOT NULL,
  `error_message` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `notification_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_id` (`notification_id`),
  KEY `notificatio_status_333b77_idx` (`status`,`created_at`),
  CONSTRAINT `notifications_app_sm_notification_id_b4905bb4_fk_notificat` FOREIGN KEY (`notification_id`) REFERENCES `notifications_app_notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_app_smsnotification`
--

LOCK TABLES `notifications_app_smsnotification` WRITE;
/*!40000 ALTER TABLE `notifications_app_smsnotification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications_app_smsnotification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_blacklist_blacklistedtoken`
--

DROP TABLE IF EXISTS `token_blacklist_blacklistedtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_blacklistedtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blacklisted_at` datetime(6) NOT NULL,
  `token_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_id` (`token_id`),
  CONSTRAINT `token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk` FOREIGN KEY (`token_id`) REFERENCES `token_blacklist_outstandingtoken` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--

LOCK TABLES `token_blacklist_blacklistedtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_blacklistedtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `token_blacklist_blacklistedtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_blacklist_outstandingtoken`
--

DROP TABLE IF EXISTS `token_blacklist_outstandingtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_outstandingtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `jti` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq` (`jti`),
  KEY `token_blacklist_outs_user_id_83bc629a_fk_accounts_` (`user_id`),
  CONSTRAINT `token_blacklist_outs_user_id_83bc629a_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--

LOCK TABLES `token_blacklist_outstandingtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` DISABLE KEYS */;
INSERT INTO `token_blacklist_outstandingtoken` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk2NTA1NSwiaWF0IjoxNzg0MzYwMjU1LCJqdGkiOiJmYzc5ZDQ4M2FkMjI0Y2JkOWFjOWI5OGY5NDE3YjcxOSIsInVzZXJfaWQiOiIxIn0.nIF66-WjQ55WivbEdSUYBcwo1-Le-VZ0DcyQIkyQqwU','2026-07-18 07:37:35.643897','2026-07-25 07:37:35.000000',NULL,'fc79d483ad224cbd9ac9b98f9417b719'),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk2NTQ1OSwiaWF0IjoxNzg0MzYwNjU5LCJqdGkiOiI1MmJkOTE3ODVkNDY0MzU1OTdkY2IyNzNmODJiZmJlYiIsInVzZXJfaWQiOiI1In0.ctB4b7DuJDMOGzwKwVUNZnJ2xmVswtJZHvJLhK7zDOo','2026-07-18 07:44:19.789397','2026-07-25 07:44:19.000000',NULL,'52bd91785d46435597dcb273f82bfbeb'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk2NzI0MiwiaWF0IjoxNzg0MzYyNDQyLCJqdGkiOiJhNjZjZDExZDJmNzg0MDc4Yjg3NWY1OTVmYWRhYTI0NyIsInVzZXJfaWQiOiIxMyJ9.vgaDTqfqoGeQ5mdrooEwvLk_ZbFcT_PlfOqLfUPdryE','2026-07-18 08:14:02.436394','2026-07-25 08:14:02.000000',13,'a66cd11d2f784078b875f595fadaa247'),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3MjA5NywiaWF0IjoxNzg0MzY3Mjk3LCJqdGkiOiI1MWNlZjdmMzM5Yjk0MjVjODEzZWU1NTZmOGMxYTBlZCIsInVzZXJfaWQiOiIxOCJ9.9EERDBN4gPQgJYi9q86OrerKrw_TfjiXsGeYBePvm1o','2026-07-18 09:34:57.869310','2026-07-25 09:34:57.000000',18,'51cef7f339b9425c813ee556f8c1a0ed'),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NTYyMCwiaWF0IjoxNzg0MzcwODIwLCJqdGkiOiI4NTJhYmE2ZjE1NDk0ZWI1OGY3YTNkYjg0MDBlYmFlZSIsInVzZXJfaWQiOiIxOSJ9.Zq2CzLqAENFA1EFED8exd0NikL5B1K1mCMkOLKYDRBY','2026-07-18 10:33:40.704282','2026-07-25 10:33:40.000000',19,'852aba6f15494eb58f7a3db8400ebaee'),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NzMyMywiaWF0IjoxNzg0MzcyNTIzLCJqdGkiOiI0MWM0NjY3MzY2MTc0MTYzYmZhN2RkMzMxM2YyODYxNiIsInVzZXJfaWQiOiIxOSJ9.tYD3FgfWeOkZrv7pnONUwwNpsocPf1EFIEK7vQ8qlkc','2026-07-18 11:02:03.010205','2026-07-25 11:02:03.000000',19,'41c4667366174163bfa7dd3313f28616'),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NzQ1MSwiaWF0IjoxNzg0MzcyNjUxLCJqdGkiOiIwNTYzYTAwNzkyY2U0NjI2ODU0NmViYmRlM2ZlNDM4MyIsInVzZXJfaWQiOiIyMCJ9.TsSUVVBD7fThDRLqaWd-18DNVhgLKRde0c1sY4sxX5s','2026-07-18 11:04:11.003768','2026-07-25 11:04:11.000000',20,'0563a00792ce46268546ebbde3fe4383'),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NzYwMSwiaWF0IjoxNzg0MzcyODAxLCJqdGkiOiIxYWRmMjI2YWRlZGQ0MmM0YjZlYzFkZjE1YjgzMDE4ZiIsInVzZXJfaWQiOiIyMCJ9.TS69Wn6w1PzAvXYQNAo72LkseqTL9GGlBaaUXPZ_AnM','2026-07-18 11:06:41.868243','2026-07-25 11:06:41.000000',20,'1adf226adedd42c4b6ec1df15b83018f'),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3ODE4MiwiaWF0IjoxNzg0MzczMzgyLCJqdGkiOiIxNDE3ZWY3ZjQ0MTg0YzA2YWIzNTQ2ZmUyNGQxYjA5NSIsInVzZXJfaWQiOiIyMCJ9.eH9Nr742v8NWIbUBfZYH5Kd1zCsg5_JronPxQMlXitY','2026-07-18 11:16:22.530979','2026-07-25 11:16:22.000000',20,'1417ef7f44184c06ab3546fe24d1b095'),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyNjgxMiwiaWF0IjoxNzg0NTIyMDEyLCJqdGkiOiJhZjEyZGFjNTA4ZDU0NTkzYTE3OTc0NTQ5ZjM3Mzc2ZSIsInVzZXJfaWQiOiIxOSJ9.BokxV5HfHIEGTSo0J2PxJHSqX27kzqcAPBvV62guB5A','2026-07-20 04:33:32.011693','2026-07-27 04:33:32.000000',19,'af12dac508d54593a17974549f37376e'),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyNzA1NywiaWF0IjoxNzg0NTIyMjU3LCJqdGkiOiI3MGE4NjlkOGRhZmI0YzMxODEwMDdhZWU0ZWVkYzU4OSIsInVzZXJfaWQiOiIxOSJ9.UN-7MVNAtnz3dXT2yTiMRt__dkN5fUWsdd9kOwbQWcs','2026-07-20 04:37:37.423597','2026-07-27 04:37:37.000000',19,'70a869d8dafb4c3181007aee4eedc589'),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyNzU3MywiaWF0IjoxNzg0NTIyNzczLCJqdGkiOiI3MTUyMmU1NDUzOGM0ZDVmYWQ1NTE0MGNlYmEwZWU1ZSIsInVzZXJfaWQiOiIxOSJ9.RPcwXqm4eWQPU-siJ6--QIqeJUuUOa07g35fJ_Y_D10','2026-07-20 04:46:13.250115','2026-07-27 04:46:13.000000',19,'71522e54538c4d5fad55140ceba0ee5e'),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyOTg4MCwiaWF0IjoxNzg0NTI1MDgwLCJqdGkiOiJkOGYyZmJlNmUxOTI0MGZmYjExMmVmMDNhY2E3YjRmYSIsInVzZXJfaWQiOiIxOSJ9.NIgM06fwGFUjPYeSteCvTZO4_RVRZw8M1-j1ugc8xzc','2026-07-20 05:24:40.053687','2026-07-27 05:24:40.000000',19,'d8f2fbe6e19240ffb112ef03aca7b4fa'),(14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzMTc0NywiaWF0IjoxNzg0NTI2OTQ3LCJqdGkiOiJmMDEyMTBmY2I5NDQ0MzlhYmI0ODVhODRmOTM5OGQ5NyIsInVzZXJfaWQiOiIyMiJ9.9xgba0HEIxTwcaWECsnU-XW5Uh8XyjCtxvy4L5HY7wE','2026-07-20 05:55:47.177055','2026-07-27 05:55:47.000000',22,'f01210fcb944439abb485a84f9398d97'),(15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzMjU5OCwiaWF0IjoxNzg0NTI3Nzk4LCJqdGkiOiIyNWJjYzFlMTBlYjA0NGYzYjdkNWExNzBmODRmMGVhZCIsInVzZXJfaWQiOiIxMCJ9.ceMMexQ4SpwEH4j_8BR5sqf0ADClC-iBdUJcJMKipBg','2026-07-20 06:09:58.637693','2026-07-27 06:09:58.000000',10,'25bcc1e10eb044f3b7d5a170f84f0ead'),(16,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzMjczMywiaWF0IjoxNzg0NTI3OTMzLCJqdGkiOiI0M2I0YjFhZmNjZTM0ZGMxODdjZTljMzExZWE2ZGNkNyIsInVzZXJfaWQiOiIxMSJ9.gJ3ZyIbNQea-W19r3bKO-OD2O9PRRCqCZwaKKp5piHI','2026-07-20 06:12:13.624317','2026-07-27 06:12:13.000000',11,'43b4b1afcce34dc187ce9c311ea6dcd7'),(17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTYyOSwiaWF0IjoxNzg0NTMwODI5LCJqdGkiOiJmZGZiY2QxNGZlZWQ0ZGM5OTUxOGFlYWRhYzRmOTBkNSIsInVzZXJfaWQiOiIxMSJ9.g9gsa8cLumh3oe102__QCncfn66ckRwbmFoEM7CYSUo','2026-07-20 07:00:29.840568','2026-07-27 07:00:29.000000',11,'fdfbcd14feed4dc99518aeadac4f90d5'),(18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTY1MCwiaWF0IjoxNzg0NTMwODUwLCJqdGkiOiI5OTA5ODI0OWM5MDI0ZWE5YTQyMjFjNTNiZTMyOWRmZCIsInVzZXJfaWQiOiIxMSJ9.Kggdqc9goPguyFURPepDI9C3diukE3BEeQupxzeKz4Y','2026-07-20 07:00:50.047442','2026-07-27 07:00:50.000000',11,'99098249c9024ea9a4221c53be329dfd'),(19,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTcyNSwiaWF0IjoxNzg0NTMwOTI1LCJqdGkiOiJlYTZmNDZmZTdhNzc0Yjc2OTkxMWViODcyZGM1MmVjOCIsInVzZXJfaWQiOiIxMSJ9.SBOmB7tjXDAo5tbsl7ZMc3DEdludgSHi6LYEP_JHS_g','2026-07-20 07:02:05.381981','2026-07-27 07:02:05.000000',11,'ea6f46fe7a774b769911eb872dc52ec8'),(20,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTc0MCwiaWF0IjoxNzg0NTMwOTQwLCJqdGkiOiIyODE4M2UyMjBkNGE0OWUxYjY5NGFhYzgyMWM0MjQ1MCIsInVzZXJfaWQiOiIxMCJ9.33NJgAOh0Ui1NnTBIg6OUKYbQttuVCxEYlADVIAsCTo','2026-07-20 07:02:20.899594','2026-07-27 07:02:20.000000',10,'28183e220d4a49e1b694aac821c42450'),(21,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTMwNzUxMCwiaWF0IjoxNzg0NzAyNzEwLCJqdGkiOiI4MWVhMzExNTE0NDg0Y2JlYWRmMzg2ZDRkYzFjOTc5MCIsInVzZXJfaWQiOiIxMSJ9.3cq6YGi1vWzA1wgtZSUdY1ViALOGjLg4lbqfjB8EIuk','2026-07-22 06:45:10.379272','2026-07-29 06:45:10.000000',11,'81ea311514484cbeadf386d4dc1c9790'),(22,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTMwOTY3MiwiaWF0IjoxNzg0NzA0ODcyLCJqdGkiOiI0ZWI5NGQyZjIyMTU0OTFlOWRlOTU5ZGZmMjg0MGM5ZiIsInVzZXJfaWQiOiIxMyJ9.MSEQA2SpdkGAjn9SQlNr2i2sJK7UWSW_pFfZ1h7DHkY','2026-07-22 07:21:12.916167','2026-07-29 07:21:12.000000',13,'4eb94d2f2215491e9de959dff2840c9f'),(23,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTkzMjEyOSwiaWF0IjoxNzg1MzI3MzI5LCJqdGkiOiIxMDJiN2Y2MWJmMGQ0N2I2OTA3ZDllYzgwNDk1NmZhMCIsInVzZXJfaWQiOiIxMiJ9.qfgByJeIeglgL_M5pFIMHaZSTCbb_fhtsFP8A21XjW0','2026-07-29 12:15:29.640171','2026-08-05 12:15:29.000000',12,'102b7f61bf0d47b6907d9ec804956fa0'),(24,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTkzMzA0NSwiaWF0IjoxNzg1MzI4MjQ1LCJqdGkiOiI4MTkyODZlM2QyZjc0NDU2YTUzODhkMWM0YWE5YTQ3MyIsInVzZXJfaWQiOiIxMiJ9.wj2jKxx5bn2D7ta7ljzZ3gPPF1kvJE4Bo2t-sPBn-CU','2026-07-29 12:30:45.137358','2026-08-05 12:30:45.000000',12,'819286e3d2f74456a5388d1c4aa9a473'),(25,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NjM2Mjg4MCwiaWF0IjoxNzg1NzU4MDgwLCJqdGkiOiJhNjAyZTRjYWU3ZGU0MmYzOWMwMTJiZDAxZjc1MTBhZCIsInVzZXJfaWQiOiIxMiJ9.UC10Y7_TjHShBapyTVeq68Bn2QSZka95Hz2vj5EN0Dw','2026-08-03 11:54:40.789156','2026-08-10 11:54:40.000000',12,'a602e4cae7de42f39c012bd01f7510ad');
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-03 17:35:37
