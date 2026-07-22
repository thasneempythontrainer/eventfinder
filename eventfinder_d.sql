-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: eventfinder_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `eventfinder_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `eventfinder_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `eventfinder_db`;

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
INSERT INTO `accounts_organizerprofile` VALUES (3,'LiveNation Events','','123 Music Avenue, Mumbai, Maharashtra','APPROVED','2026-07-18 08:07:03.240623','2026-07-18 08:07:03.240651',11),(4,'Fiesta Productions','','456 Festival Road, Bangalore, Karnataka','APPROVED','2026-07-18 08:07:03.257957','2026-07-18 08:07:03.258001',12),(6,'Brandd','government_ids/press-button.png','tght','APPROVED','2026-07-18 09:34:45.867136','2026-07-20 06:10:39.097356',18);
/*!40000 ALTER TABLE `accounts_organizerprofile` ENABLE KEYS */;
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
INSERT INTO `accounts_user` VALUES (10,'pbkdf2_sha256$1200000$lxXPITNHleXH1tWCTECV94$PL9MluqHlwALIbBm33O1jPTxN0c6Am6vAKIE+3pnams=',NULL,1,'admin','Admin','User','admin@eventfinder.com',1,1,'2026-07-18 08:06:52.235975','ADMIN','+919000000001','',1,'2026-07-18 08:06:53.722654','2026-07-20 06:08:27.211655'),(11,'pbkdf2_sha256$1200000$sCFKtTwFVWz0fxAdJqGBSB$XfeCoRy5/vQNOyT6/u0L4rtQ7Et09/bQkblT6XYZ5Zo=',NULL,0,'organizer1','Rahul','Sharma','organizer1@eventfinder.com',0,1,'2026-07-18 08:06:53.727591','ORGANIZER','+919000000002','',1,'2026-07-18 08:06:55.275426','2026-07-20 06:08:28.845598'),(12,'pbkdf2_sha256$1200000$9p4aTrai9Vokm2cbyA5Q4b$MNF6GJ1CLniuHXyENYTZ2jK24nmRP2EZo4ZgOc8ooNI=',NULL,0,'organizer2','Priya','Patel','organizer2@eventfinder.com',0,1,'2026-07-18 08:06:55.325227','ORGANIZER','+919000000003','',1,'2026-07-18 08:06:56.840023','2026-07-18 08:06:56.840036'),(13,'pbkdf2_sha256$1200000$75owjgGWz9a5CSm4It7jUH$qYX2tIBYBIawOWT5nUDwYdQBfbk8W7P8osyyJ2d5bww=',NULL,0,'user1','Amit','Kumar','user1@eventfinder.com',0,1,'2026-07-18 08:06:56.929016','USER','+919000000004','',1,'2026-07-18 08:06:58.414251','2026-07-20 06:08:30.367869'),(14,'pbkdf2_sha256$1200000$HMnuVqSJ872PjxrDfVjPCl$kqBzJs56vXi/0E39PXQeLooG8osm7DA398x04p5AoIo=',NULL,0,'user2','Sneha','Reddy','user2@eventfinder.com',0,1,'2026-07-18 08:06:58.515817','USER','+919000000005','',1,'2026-07-18 08:07:00.041034','2026-07-18 08:07:00.041047'),(15,'pbkdf2_sha256$1200000$g2rw01OD7yFCF8blgQnUwd$YgP2u36N1NUn5WLO5lHvoL2IdB7Wn1VPs6mIBLeSfmk=',NULL,0,'user3','Vikram','Singh','user3@eventfinder.com',0,1,'2026-07-18 08:07:00.072076','USER','+919000000006','',1,'2026-07-18 08:07:01.499488','2026-07-18 08:07:01.499503'),(16,'pbkdf2_sha256$1200000$UMn3YGC63wd3tM8h5Dksdd$VyxI72+Do7l7tslYGFrpR5DmhLyB+ENZG7Bf2S/qZk4=',NULL,0,'user4','Neha','Gupta','user4@eventfinder.com',0,1,'2026-07-18 08:07:01.621571','USER','+919000000007','',1,'2026-07-18 08:07:03.119986','2026-07-18 08:07:03.119999'),(18,'pbkdf2_sha256$1200000$m6ri2f9lZlYs35ncSn3VmK$ivxEjdIJjn9jsDIeJDsxUQBhq9OzJ2aTjztHvJTX3M4=',NULL,0,'johndoe','John','Doe','johndoe@gmail.com',0,1,'2026-07-18 09:34:44.431085','ORGANIZER',NULL,'',0,'2026-07-18 09:34:45.813729','2026-07-18 09:34:45.813750'),(19,'pbkdf2_sha256$1200000$n3PxkxW2oqLpJ8I7Gb89xn$YIvyEZ430Ar5w9FfZ2fMv/im+xb9uQu9GGXbHag+3aI=',NULL,0,'johndoe1','John','Doe','johndoe@eventfinder.com',0,1,'2026-07-18 10:33:26.138977','USER',NULL,'',0,'2026-07-18 10:33:27.562610','2026-07-18 10:33:27.562625'),(20,'pbkdf2_sha256$1200000$uIguOoBdNfu1cVbcNZlnJH$KlmrQ0jbCxtYS5MzVqjFVlcNiOnhyzC0A3RrRPDwyOI=',NULL,0,'nashwa','NASHWA','VP','nashwa@eventfinder.com',0,1,'2026-07-18 11:03:58.770765','USER',NULL,'',0,'2026-07-18 11:04:00.187586','2026-07-18 11:04:00.187609'),(21,'pbkdf2_sha256$1200000$GJIs0VgHnG8F0QUpxytix0$bxcVwUaWlwHavyFSSXFWcr8O0OWZwRWRDh5361HIyvE=',NULL,1,'admin1','','','',1,1,'2026-07-20 05:54:42.931509','USER',NULL,'',0,'2026-07-20 05:54:44.267861','2026-07-20 05:54:44.267879'),(22,'pbkdf2_sha256$1200000$OrXaPhPK1NajxM4BiBtG32$huKRNT5vNZ8zUCBjvF5MeFO9f/fJpU0uc015YGQiyr4=',NULL,1,'adminn','','','adminn@gmail.com',1,1,'2026-07-20 05:55:28.907250','USER',NULL,'',0,'2026-07-20 05:55:30.236218','2026-07-20 05:55:30.236236');
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
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add Token',6,'add_token'),(22,'Can change Token',6,'change_token'),(23,'Can delete Token',6,'delete_token'),(24,'Can view Token',6,'view_token'),(25,'Can add Token',7,'add_tokenproxy'),(26,'Can change Token',7,'change_tokenproxy'),(27,'Can delete Token',7,'delete_tokenproxy'),(28,'Can view Token',7,'view_tokenproxy'),(29,'Can add Blacklisted Token',8,'add_blacklistedtoken'),(30,'Can change Blacklisted Token',8,'change_blacklistedtoken'),(31,'Can delete Blacklisted Token',8,'delete_blacklistedtoken'),(32,'Can view Blacklisted Token',8,'view_blacklistedtoken'),(33,'Can add Outstanding Token',9,'add_outstandingtoken'),(34,'Can change Outstanding Token',9,'change_outstandingtoken'),(35,'Can delete Outstanding Token',9,'delete_outstandingtoken'),(36,'Can view Outstanding Token',9,'view_outstandingtoken'),(37,'Can add crontab',11,'add_crontabschedule'),(38,'Can change crontab',11,'change_crontabschedule'),(39,'Can delete crontab',11,'delete_crontabschedule'),(40,'Can view crontab',11,'view_crontabschedule'),(41,'Can add interval',12,'add_intervalschedule'),(42,'Can change interval',12,'change_intervalschedule'),(43,'Can delete interval',12,'delete_intervalschedule'),(44,'Can view interval',12,'view_intervalschedule'),(45,'Can add periodic task',13,'add_periodictask'),(46,'Can change periodic task',13,'change_periodictask'),(47,'Can delete periodic task',13,'delete_periodictask'),(48,'Can view periodic task',13,'view_periodictask'),(49,'Can add periodic task track',14,'add_periodictasks'),(50,'Can change periodic task track',14,'change_periodictasks'),(51,'Can delete periodic task track',14,'delete_periodictasks'),(52,'Can view periodic task track',14,'view_periodictasks'),(53,'Can add solar event',15,'add_solarschedule'),(54,'Can change solar event',15,'change_solarschedule'),(55,'Can delete solar event',15,'delete_solarschedule'),(56,'Can view solar event',15,'view_solarschedule'),(57,'Can add clocked',10,'add_clockedschedule'),(58,'Can change clocked',10,'change_clockedschedule'),(59,'Can delete clocked',10,'delete_clockedschedule'),(60,'Can view clocked',10,'view_clockedschedule'),(61,'Can add task result',18,'add_taskresult'),(62,'Can change task result',18,'change_taskresult'),(63,'Can delete task result',18,'delete_taskresult'),(64,'Can view task result',18,'view_taskresult'),(65,'Can add chord counter',16,'add_chordcounter'),(66,'Can change chord counter',16,'change_chordcounter'),(67,'Can delete chord counter',16,'delete_chordcounter'),(68,'Can view chord counter',16,'view_chordcounter'),(69,'Can add group result',17,'add_groupresult'),(70,'Can change group result',17,'change_groupresult'),(71,'Can delete group result',17,'delete_groupresult'),(72,'Can view group result',17,'view_groupresult'),(73,'Can add user',20,'add_user'),(74,'Can change user',20,'change_user'),(75,'Can delete user',20,'delete_user'),(76,'Can view user',20,'view_user'),(77,'Can add organizer profile',19,'add_organizerprofile'),(78,'Can change organizer profile',19,'change_organizerprofile'),(79,'Can delete organizer profile',19,'delete_organizerprofile'),(80,'Can view organizer profile',19,'view_organizerprofile'),(81,'Can add event',22,'add_event'),(82,'Can change event',22,'change_event'),(83,'Can delete event',22,'delete_event'),(84,'Can view event',22,'view_event'),(85,'Can add category',21,'add_category'),(86,'Can change category',21,'change_category'),(87,'Can delete category',21,'delete_category'),(88,'Can view category',21,'view_category'),(89,'Can add event image',23,'add_eventimage'),(90,'Can change event image',23,'change_eventimage'),(91,'Can delete event image',23,'delete_eventimage'),(92,'Can view event image',23,'view_eventimage'),(93,'Can add booking',24,'add_booking'),(94,'Can change booking',24,'change_booking'),(95,'Can delete booking',24,'delete_booking'),(96,'Can view booking',24,'view_booking'),(97,'Can add ticket',25,'add_ticket'),(98,'Can change ticket',25,'change_ticket'),(99,'Can delete ticket',25,'delete_ticket'),(100,'Can view ticket',25,'view_ticket'),(101,'Can add event experience',26,'add_eventexperience'),(102,'Can change event experience',26,'change_eventexperience'),(103,'Can delete event experience',26,'delete_eventexperience'),(104,'Can view event experience',26,'view_eventexperience'),(105,'Can add experience comment',27,'add_experiencecomment'),(106,'Can change experience comment',27,'change_experiencecomment'),(107,'Can delete experience comment',27,'delete_experiencecomment'),(108,'Can view experience comment',27,'view_experiencecomment'),(109,'Can add experience image',28,'add_experienceimage'),(110,'Can change experience image',28,'change_experienceimage'),(111,'Can delete experience image',28,'delete_experienceimage'),(112,'Can view experience image',28,'view_experienceimage'),(113,'Can add experience like',29,'add_experiencelike'),(114,'Can change experience like',29,'change_experiencelike'),(115,'Can delete experience like',29,'delete_experiencelike'),(116,'Can view experience like',29,'view_experiencelike'),(117,'Can add chat room',31,'add_chatroom'),(118,'Can change chat room',31,'change_chatroom'),(119,'Can delete chat room',31,'delete_chatroom'),(120,'Can view chat room',31,'view_chatroom'),(121,'Can add chat message',30,'add_chatmessage'),(122,'Can change chat message',30,'change_chatmessage'),(123,'Can delete chat message',30,'delete_chatmessage'),(124,'Can view chat message',30,'view_chatmessage'),(125,'Can add chat room member',32,'add_chatroommember'),(126,'Can change chat room member',32,'change_chatroommember'),(127,'Can delete chat room member',32,'delete_chatroommember'),(128,'Can view chat room member',32,'view_chatroommember'),(129,'Can add notification',34,'add_notification'),(130,'Can change notification',34,'change_notification'),(131,'Can delete notification',34,'delete_notification'),(132,'Can view notification',34,'view_notification'),(133,'Can add email notification',33,'add_emailnotification'),(134,'Can change email notification',33,'change_emailnotification'),(135,'Can delete email notification',33,'delete_emailnotification'),(136,'Can view email notification',33,'view_emailnotification'),(137,'Can add sms notification',35,'add_smsnotification'),(138,'Can change sms notification',35,'change_smsnotification'),(139,'Can delete sms notification',35,'delete_smsnotification'),(140,'Can view sms notification',35,'view_smsnotification');
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_booking`
--

LOCK TABLES `bookings_booking` WRITE;
/*!40000 ALTER TABLE `bookings_booking` DISABLE KEYS */;
INSERT INTO `bookings_booking` VALUES (15,3,7500.00,'CONFIRMED',NULL,'BKB4CECB1E','2026-07-18 08:07:13.545024','2026-07-18 08:07:13.545078',11,13),(16,2,1000.00,'CONFIRMED',NULL,'BK0A58D864','2026-07-18 08:07:13.570241','2026-07-18 08:07:13.570269',14,13),(17,1,8000.00,'CONFIRMED',NULL,'BKEDD4F4DB','2026-07-18 08:07:13.588916','2026-07-18 08:07:13.588943',17,13),(18,2,5000.00,'CONFIRMED',NULL,'BK34B4D64B','2026-07-18 08:07:13.604237','2026-07-18 08:07:13.604267',11,14),(19,1,5000.00,'CONFIRMED',NULL,'BKE60E2F3E','2026-07-18 08:07:13.623702','2026-07-18 08:07:13.623729',13,14),(20,4,6000.00,'CONFIRMED',NULL,'BK54BF8767','2026-07-18 08:07:13.639733','2026-07-18 08:07:13.639761',15,14),(21,2,9000.00,'CONFIRMED',NULL,'BK30F263B3','2026-07-18 08:07:13.666864','2026-07-18 08:07:13.666892',12,15),(22,1,500.00,'CONFIRMED',NULL,'BK0D42F2C7','2026-07-18 08:07:13.687349','2026-07-18 08:07:13.687379',14,15),(23,2,600.00,'CONFIRMED',NULL,'BK9BEFF16F','2026-07-18 08:07:13.702937','2026-07-18 08:07:13.703002',16,15),(24,1,2500.00,'CONFIRMED',NULL,'BK83E1BB72','2026-07-18 08:07:13.721749','2026-07-18 08:07:13.721776',11,16),(25,3,2400.00,'CONFIRMED',NULL,'BK12ACB769','2026-07-18 08:07:13.736196','2026-07-18 08:07:13.736228',18,16),(26,2,4000.00,'CONFIRMED',NULL,'BK3168553E','2026-07-18 08:07:13.758081','2026-07-18 08:07:13.758111',20,16),(27,1,3500.00,'PENDING',NULL,'BK14ECFFC1','2026-07-18 08:07:13.777352','2026-07-18 08:07:13.777380',19,13),(28,2,3000.00,'CANCELLED',NULL,'BKC9E8239E','2026-07-18 08:07:13.796040','2026-07-18 08:07:13.796071',15,14),(29,1,3500.00,'CANCELLED',NULL,'BK4FCF0E4A','2026-07-18 08:23:05.708402','2026-07-18 08:23:17.914476',19,13),(30,1,5000.00,'CONFIRMED',NULL,'BKA850933D','2026-07-18 10:34:09.018559','2026-07-18 10:34:09.018587',13,19),(31,1,5000.00,'CONFIRMED',NULL,'BKDDAC941D','2026-07-18 11:05:51.205339','2026-07-18 11:05:51.205382',13,20),(32,1,8000.00,'CONFIRMED',NULL,'BKA7A8294D','2026-07-18 11:17:48.915914','2026-07-18 11:17:48.915942',17,20),(33,1,5000.00,'CONFIRMED',NULL,'BK1885D190','2026-07-20 05:50:24.710450','2026-07-20 05:50:24.710983',13,19),(34,1,3500.00,'CONFIRMED',NULL,'BK53626B53','2026-07-20 06:05:54.317868','2026-07-20 06:05:54.319737',19,20);
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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_ticket`
--

LOCK TABLES `bookings_ticket` WRITE;
/*!40000 ALTER TABLE `bookings_ticket` DISABLE KEYS */;
INSERT INTO `bookings_ticket` VALUES (28,'BKB4CECB1ET1','',0,NULL,'2026-07-18 08:07:13.555176',15),(29,'BKB4CECB1ET2','',0,NULL,'2026-07-18 08:07:13.560727',15),(30,'BKB4CECB1ET3','',0,NULL,'2026-07-18 08:07:13.565373',15),(31,'BK0A58D864T1','',0,NULL,'2026-07-18 08:07:13.580170',16),(32,'BK0A58D864T2','',0,NULL,'2026-07-18 08:07:13.584565',16),(33,'BKEDD4F4DBT1','',0,NULL,'2026-07-18 08:07:13.600283',17),(34,'BK34B4D64BT1','',0,NULL,'2026-07-18 08:07:13.614438',18),(35,'BK34B4D64BT2','',0,NULL,'2026-07-18 08:07:13.619398',18),(36,'BKE60E2F3ET1','',0,NULL,'2026-07-18 08:07:13.635089',19),(37,'BK54BF8767T1','',0,NULL,'2026-07-18 08:07:13.649332',20),(38,'BK54BF8767T2','',0,NULL,'2026-07-18 08:07:13.653794',20),(39,'BK54BF8767T3','',0,NULL,'2026-07-18 08:07:13.657972',20),(40,'BK54BF8767T4','',0,NULL,'2026-07-18 08:07:13.662659',20),(41,'BK30F263B3T1','',0,NULL,'2026-07-18 08:07:13.677745',21),(42,'BK30F263B3T2','',0,NULL,'2026-07-18 08:07:13.682598',21),(43,'BK0D42F2C7T1','',0,NULL,'2026-07-18 08:07:13.697974',22),(44,'BK9BEFF16FT1','',0,NULL,'2026-07-18 08:07:13.712741',23),(45,'BK9BEFF16FT2','',0,NULL,'2026-07-18 08:07:13.717379',23),(46,'BK83E1BB72T1','',0,NULL,'2026-07-18 08:07:13.731741',24),(47,'BK12ACB769T1','',0,NULL,'2026-07-18 08:07:13.746009',25),(48,'BK12ACB769T2','',0,NULL,'2026-07-18 08:07:13.750880',25),(49,'BK12ACB769T3','',0,NULL,'2026-07-18 08:07:13.754363',25),(50,'BK3168553ET1','',0,NULL,'2026-07-18 08:07:13.768076',26),(51,'BK3168553ET2','',0,NULL,'2026-07-18 08:07:13.772706',26),(52,'BK14ECFFC1T1','',0,NULL,'2026-07-18 08:07:13.791039',27),(53,'BKC9E8239ET1','',0,NULL,'2026-07-18 08:07:13.806202',28),(54,'BKC9E8239ET2','',0,NULL,'2026-07-18 08:07:13.810076',28),(55,'BK4FCF0E4AT1','',0,NULL,'2026-07-18 08:23:05.718040',29),(56,'BKA850933DT1','qrcodes/qr_BKA850933DT1.png',0,NULL,'2026-07-18 10:34:09.033933',30),(57,'BKDDAC941DT1','',0,NULL,'2026-07-18 11:05:51.215358',31),(58,'BKA7A8294DT1','',0,NULL,'2026-07-18 11:17:48.922123',32),(59,'BK1885D190T1','qrcodes/qr_BK1885D190T1.png',0,NULL,'2026-07-20 05:50:24.780280',33),(60,'BK53626B53T1','qrcodes/qr_BK53626B53T1.png',0,NULL,'2026-07-20 06:05:54.341625',34);
/*!40000 ALTER TABLE `bookings_ticket` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_chatroom`
--

LOCK TABLES `chat_chatroom` WRITE;
/*!40000 ALTER TABLE `chat_chatroom` DISABLE KEYS */;
INSERT INTO `chat_chatroom` VALUES (1,'2026-07-18 11:02:13.411985','2026-07-18 11:02:13.412020',11),(2,'2026-07-18 11:02:40.201443','2026-07-18 11:02:40.201474',13),(3,'2026-07-18 11:14:40.384150','2026-07-18 11:14:40.384177',12),(4,'2026-07-18 11:18:01.585381','2026-07-18 11:18:01.585425',17);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_chatroommember`
--

LOCK TABLES `chat_chatroommember` WRITE;
/*!40000 ALTER TABLE `chat_chatroommember` DISABLE KEYS */;
INSERT INTO `chat_chatroommember` VALUES (1,'2026-07-18 11:02:13.451693','2026-07-18 11:02:27.241316',0,1,19),(2,'2026-07-18 11:02:40.212900','2026-07-20 05:52:03.785088',0,2,19),(3,'2026-07-18 11:04:16.250154','2026-07-18 11:17:22.892440',0,2,20),(4,'2026-07-18 11:14:40.393848','2026-07-18 11:15:34.722916',0,3,20),(5,'2026-07-18 11:18:01.595112','2026-07-18 11:18:05.205290',0,4,20),(6,'2026-07-20 04:22:24.965461','2026-07-20 04:22:24.965488',1,4,19);
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (19,'accounts','organizerprofile'),(20,'accounts','user'),(1,'admin','logentry'),(2,'auth','group'),(3,'auth','permission'),(6,'authtoken','token'),(7,'authtoken','tokenproxy'),(24,'bookings','booking'),(25,'bookings','ticket'),(30,'chat','chatmessage'),(31,'chat','chatroom'),(32,'chat','chatroommember'),(26,'community','eventexperience'),(27,'community','experiencecomment'),(28,'community','experienceimage'),(29,'community','experiencelike'),(4,'contenttypes','contenttype'),(10,'django_celery_beat','clockedschedule'),(11,'django_celery_beat','crontabschedule'),(12,'django_celery_beat','intervalschedule'),(13,'django_celery_beat','periodictask'),(14,'django_celery_beat','periodictasks'),(15,'django_celery_beat','solarschedule'),(16,'django_celery_results','chordcounter'),(17,'django_celery_results','groupresult'),(18,'django_celery_results','taskresult'),(21,'events','category'),(22,'events','event'),(23,'events','eventimage'),(33,'notifications_app','emailnotification'),(34,'notifications_app','notification'),(35,'notifications_app','smsnotification'),(5,'sessions','session'),(8,'token_blacklist','blacklistedtoken'),(9,'token_blacklist','outstandingtoken');
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
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-07-18 04:50:39.732899'),(2,'contenttypes','0002_remove_content_type_name','2026-07-18 04:50:39.958921'),(3,'auth','0001_initial','2026-07-18 04:50:40.964875'),(4,'auth','0002_alter_permission_name_max_length','2026-07-18 04:50:41.088757'),(5,'auth','0003_alter_user_email_max_length','2026-07-18 04:50:41.101984'),(6,'auth','0004_alter_user_username_opts','2026-07-18 04:50:41.115459'),(7,'auth','0005_alter_user_last_login_null','2026-07-18 04:50:41.126692'),(8,'auth','0006_require_contenttypes_0002','2026-07-18 04:50:41.134995'),(9,'auth','0007_alter_validators_add_error_messages','2026-07-18 04:50:41.147053'),(10,'auth','0008_alter_user_username_max_length','2026-07-18 04:50:41.156199'),(11,'auth','0009_alter_user_last_name_max_length','2026-07-18 04:50:41.165878'),(12,'auth','0010_alter_group_name_max_length','2026-07-18 04:50:41.188122'),(13,'auth','0011_update_proxy_permissions','2026-07-18 04:50:41.198576'),(14,'auth','0012_alter_user_first_name_max_length','2026-07-18 04:50:41.208598'),(15,'accounts','0001_initial','2026-07-18 04:50:41.883451'),(16,'admin','0001_initial','2026-07-18 04:50:42.111482'),(17,'admin','0002_logentry_remove_auto_add','2026-07-18 04:50:42.126162'),(18,'admin','0003_logentry_add_action_flag_choices','2026-07-18 04:50:42.151634'),(19,'authtoken','0001_initial','2026-07-18 04:50:42.296671'),(20,'authtoken','0002_auto_20160226_1747','2026-07-18 04:50:42.344980'),(21,'authtoken','0003_tokenproxy','2026-07-18 04:50:42.349676'),(22,'authtoken','0004_alter_tokenproxy_options','2026-07-18 04:50:42.358857'),(23,'django_celery_beat','0001_initial','2026-07-18 04:50:42.730089'),(24,'django_celery_beat','0002_auto_20161118_0346','2026-07-18 04:50:42.896292'),(25,'django_celery_beat','0003_auto_20161209_0049','2026-07-18 04:50:42.929601'),(26,'django_celery_beat','0004_auto_20170221_0000','2026-07-18 04:50:42.936814'),(27,'django_celery_beat','0005_add_solarschedule_events_choices','2026-07-18 04:50:42.954442'),(28,'django_celery_beat','0006_auto_20180322_0932','2026-07-18 04:50:43.151589'),(29,'django_celery_beat','0007_auto_20180521_0826','2026-07-18 04:50:43.374761'),(30,'django_celery_beat','0008_auto_20180914_1922','2026-07-18 04:50:43.421523'),(31,'django_celery_beat','0006_auto_20180210_1226','2026-07-18 04:50:43.467681'),(32,'django_celery_beat','0006_periodictask_priority','2026-07-18 04:50:43.588056'),(33,'django_celery_beat','0009_periodictask_headers','2026-07-18 04:50:43.711252'),(34,'django_celery_beat','0010_auto_20190429_0326','2026-07-18 04:50:43.956237'),(35,'django_celery_beat','0011_auto_20190508_0153','2026-07-18 04:50:44.186415'),(36,'django_celery_beat','0012_periodictask_expire_seconds','2026-07-18 04:50:44.299435'),(37,'django_celery_beat','0013_auto_20200609_0727','2026-07-18 04:50:44.313896'),(38,'django_celery_beat','0014_remove_clockedschedule_enabled','2026-07-18 04:50:44.376180'),(39,'django_celery_beat','0015_edit_solarschedule_events_choices','2026-07-18 04:50:44.384008'),(40,'django_celery_beat','0016_alter_crontabschedule_timezone','2026-07-18 04:50:44.400824'),(41,'django_celery_beat','0017_alter_crontabschedule_month_of_year','2026-07-18 04:50:44.413200'),(42,'django_celery_beat','0018_improve_crontab_helptext','2026-07-18 04:50:44.436668'),(43,'django_celery_beat','0019_alter_periodictasks_options','2026-07-18 04:50:44.441941'),(44,'django_celery_results','0001_initial','2026-07-18 04:50:44.538933'),(45,'django_celery_results','0002_add_task_name_args_kwargs','2026-07-18 04:50:44.800040'),(46,'django_celery_results','0003_auto_20181106_1101','2026-07-18 04:50:44.805052'),(47,'django_celery_results','0004_auto_20190516_0412','2026-07-18 04:50:44.901898'),(48,'django_celery_results','0005_taskresult_worker','2026-07-18 04:50:45.026891'),(49,'django_celery_results','0006_taskresult_date_created','2026-07-18 04:50:45.191892'),(50,'django_celery_results','0007_remove_taskresult_hidden','2026-07-18 04:50:45.284995'),(51,'django_celery_results','0008_chordcounter','2026-07-18 04:50:45.328235'),(52,'django_celery_results','0009_groupresult','2026-07-18 04:50:45.718125'),(53,'django_celery_results','0010_remove_duplicate_indices','2026-07-18 04:50:45.731706'),(54,'django_celery_results','0011_taskresult_periodic_task_name','2026-07-18 04:50:45.831761'),(55,'django_celery_results','0012_taskresult_date_started','2026-07-18 04:50:46.069243'),(56,'django_celery_results','0013_taskresult_django_cele_periodi_1993cf_idx','2026-07-18 04:50:46.103244'),(57,'django_celery_results','0014_alter_taskresult_status','2026-07-18 04:50:46.109765'),(58,'sessions','0001_initial','2026-07-18 04:50:46.165899'),(59,'token_blacklist','0001_initial','2026-07-18 04:50:46.458455'),(60,'token_blacklist','0002_outstandingtoken_jti_hex','2026-07-18 04:50:46.563051'),(61,'token_blacklist','0003_auto_20171017_2007','2026-07-18 04:50:46.603714'),(62,'token_blacklist','0004_auto_20171017_2013','2026-07-18 04:50:46.719097'),(63,'token_blacklist','0005_remove_outstandingtoken_jti','2026-07-18 04:50:46.816994'),(64,'token_blacklist','0006_auto_20171017_2113','2026-07-18 04:50:46.854603'),(65,'token_blacklist','0007_auto_20171017_2214','2026-07-18 04:50:47.130418'),(66,'token_blacklist','0008_migrate_to_bigautofield','2026-07-18 04:50:47.587773'),(67,'token_blacklist','0010_fix_migrate_to_bigautofield','2026-07-18 04:50:47.621700'),(68,'token_blacklist','0011_linearizes_history','2026-07-18 04:50:47.624934'),(69,'token_blacklist','0012_alter_outstandingtoken_user','2026-07-18 04:50:47.642257'),(70,'token_blacklist','0013_alter_blacklistedtoken_options_and_more','2026-07-18 04:50:47.720771'),(71,'events','0001_initial','2026-07-18 05:35:12.507877'),(72,'bookings','0001_initial','2026-07-18 06:45:52.547258'),(73,'chat','0001_initial','2026-07-18 06:45:53.261301'),(74,'community','0001_initial','2026-07-18 06:45:54.343698'),(75,'notifications_app','0001_initial','2026-07-18 06:45:55.286542'),(76,'accounts','0002_alter_user_phone_number','2026-07-18 09:27:06.272523'),(77,'events','0002_alter_event_status','2026-07-20 06:04:48.673010'),(78,'notifications_app','0002_alter_notification_notification_type','2026-07-20 06:33:00.391813');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events_category`
--

LOCK TABLES `events_category` WRITE;
/*!40000 ALTER TABLE `events_category` DISABLE KEYS */;
INSERT INTO `events_category` VALUES (9,'Music','Live music concerts and performances','music_note','2026-07-18 08:07:03.265990'),(10,'Sports','Sports events and tournaments','sports_soccer','2026-07-18 08:07:03.271651'),(11,'Technology','Tech conferences and meetups','computer','2026-07-18 08:07:03.276341'),(12,'Food & Drink','Food festivals and culinary events','restaurant','2026-07-18 08:07:03.280255'),(13,'Art & Culture','Art exhibitions and cultural shows','palette','2026-07-18 08:07:03.285762'),(14,'Business','Business conferences and networking','business_center','2026-07-18 08:07:03.289319'),(15,'Health & Wellness','Yoga, fitness, and wellness events','fitness_center','2026-07-18 08:07:03.293081'),(16,'Education','Workshops, seminars, and courses','school','2026-07-18 08:07:03.297316');
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
INSERT INTO `events_event` VALUES (11,'Summer Music Festival 2026','Join us for an electrifying weekend of live music featuring top artists from around the country. Three stages, food trucks, and an unforgettable atmosphere.','Jawaharlal Nehru Stadium','Delhi',28.580900,77.233100,'2026-08-02','2026-08-04','16:00:00.000000','23:00:00.000000','event_banners/music_banner.jpg',2500.00,5000,4994,'UPCOMING','2026-07-18 08:07:04.288014','2026-07-18 08:07:13.726116',9,11),(12,'Jazz Night Under the Stars','An intimate evening of smooth jazz under the open sky. Featuring renowned jazz musicians and a premium dining experience.','Royal Orchid Terrace','Mumbai',19.076000,72.877700,'2026-08-12','2026-08-12','19:00:00.000000','23:30:00.000000','event_banners/jazz_banner.jpg',4500.00,500,498,'UPCOMING','2026-07-18 08:07:05.054980','2026-07-18 08:07:13.671299',9,11),(13,'TechSummit 2026 - AI & Beyond','India\'s premier technology conference exploring AI, machine learning, blockchain, and the future of tech. 50+ speakers, hands-on workshops, and networking opportunities.','Bangalore International Exhibition Centre','Bangalore',13.082700,77.587700,'2026-08-17','2026-08-19','09:00:00.000000','18:00:00.000000','event_banners/tech_banner.jpg',5000.00,2000,1996,'UPCOMING','2026-07-18 08:07:06.845419','2026-07-20 05:50:25.255754',11,12),(14,'Street Food Carnival','Taste the best street food from across India! 100+ food stalls, live cooking shows, eating contests, and family-friendly activities.','MG Road Carnival Ground','Chennai',13.082700,80.270700,'2026-07-28','2026-07-30','11:00:00.000000','22:00:00.000000','event_banners/food_banner.jpg',500.00,10000,9997,'UPCOMING','2026-07-18 08:07:07.958521','2026-07-18 08:07:13.691859',12,12),(15,'Champions Cricket League','Watch the most exciting T20 cricket action of the season. 8 teams compete for the championship trophy over 2 thrilling weeks.','Eden Gardens','Kolkata',22.564600,88.343300,'2026-07-23','2026-08-05','14:00:00.000000','22:00:00.000000','event_banners/cricket_banner.jpg',1500.00,60000,59994,'UPCOMING','2026-07-18 08:07:09.602762','2026-07-18 08:07:13.800643',10,11),(16,'Rangoli Art Exhibition','A stunning exhibition of traditional and contemporary Indian art. Featuring 200+ artists and interactive art installations.','National Gallery of Modern Art','Mumbai',19.059600,72.829500,'2026-07-13','2026-07-28','10:00:00.000000','19:00:00.000000','event_banners/art_banner.jpg',300.00,1000,998,'ONGOING','2026-07-18 08:07:10.409175','2026-07-18 08:07:13.707057',13,12),(17,'Startup India Summit','Connect with 500+ startup founders, investors, and industry leaders. Pitch competitions, panel discussions, and networking dinners.','Taj Palace Hotel','Delhi',28.613900,77.209000,'2026-06-28','2026-06-29','09:00:00.000000','18:00:00.000000','event_banners/startup_banner.jpg',8000.00,800,798,'COMPLETED','2026-07-18 08:07:10.966941','2026-07-18 11:17:48.928022',14,11),(18,'Sunrise Yoga Festival','Start your day with peace and energy. Guided yoga sessions by world-class instructors, meditation workshops, and organic food stalls.','Marine Drive Promenade','Mumbai',18.943200,72.823400,'2026-07-21','2026-07-21','05:30:00.000000','09:00:00.000000','event_banners/yoga_banner.jpg',800.00,2000,1997,'UPCOMING','2026-07-18 08:07:12.412159','2026-07-18 08:07:13.740711',15,12),(19,'Python Programming Bootcamp','3-day intensive Python bootcamp covering web development, data science, and automation. Hands-on projects and certification included.','IIT Bombay Convention Centre','Mumbai',19.133400,72.913300,'2026-08-07','2026-08-09','09:00:00.000000','17:00:00.000000','event_banners/python_banner.jpg',3500.00,200,198,'UPCOMING','2026-07-18 08:07:12.950158','2026-07-20 06:05:54.645941',16,11),(20,'EDM Nights Bangalore','Experience the best electronic dance music party in Bangalore. International DJs, laser shows, and an electrifying atmosphere.','Phoenix Marketcity','Bangalore',12.998700,77.690600,'2026-07-25','2026-07-25','20:00:00.000000','02:00:00.000000','event_banners/edm_banner.jpg',2000.00,3000,2998,'UPCOMING','2026-07-18 08:07:13.540061','2026-07-18 08:07:13.762489',9,12),(21,'Biriyani challenge','fghrhrfh','kochi','malp',NULL,NULL,'2026-07-18','2026-07-25','19:01:00.000000','19:01:00.000000','event_banners/play-button-arrowhead.png',99.99,97,97,'UPCOMING','2026-07-18 10:32:30.496383','2026-07-18 10:32:30.496415',12,18);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_app_notification`
--

LOCK TABLES `notifications_app_notification` WRITE;
/*!40000 ALTER TABLE `notifications_app_notification` DISABLE KEYS */;
INSERT INTO `notifications_app_notification` VALUES (6,'BOOKING_CONFIRMATION','Booking Confirmed','Your booking for Summer Music Festival 2026 has been confirmed!',0,NULL,'2026-07-18 08:07:13.840095',NULL,11,13),(7,'EVENT_UPDATE','Event Update','Startup India Summit has been completed. Share your experience!',0,NULL,'2026-07-18 08:07:13.846306',NULL,17,13),(8,'BOOKING_CONFIRMATION','Booking Confirmed','Your booking for TechSummit 2026 - AI & Beyond is confirmed!',0,NULL,'2026-07-18 08:07:13.852460',NULL,13,14),(9,'BOOKING_REMINDER','Event Reminder','Sunrise Yoga Festival is starting in 3 days!',0,NULL,'2026-07-18 08:07:13.858755',NULL,18,16),(10,'ORGANIZER_APPROVAL','Account Approved','Your organizer account has been approved!',1,'2026-07-20 06:34:01.437473','2026-07-18 08:07:13.864262',NULL,NULL,11);
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--

LOCK TABLES `token_blacklist_outstandingtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` DISABLE KEYS */;
INSERT INTO `token_blacklist_outstandingtoken` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk2NTA1NSwiaWF0IjoxNzg0MzYwMjU1LCJqdGkiOiJmYzc5ZDQ4M2FkMjI0Y2JkOWFjOWI5OGY5NDE3YjcxOSIsInVzZXJfaWQiOiIxIn0.nIF66-WjQ55WivbEdSUYBcwo1-Le-VZ0DcyQIkyQqwU','2026-07-18 07:37:35.643897','2026-07-25 07:37:35.000000',NULL,'fc79d483ad224cbd9ac9b98f9417b719'),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk2NTQ1OSwiaWF0IjoxNzg0MzYwNjU5LCJqdGkiOiI1MmJkOTE3ODVkNDY0MzU1OTdkY2IyNzNmODJiZmJlYiIsInVzZXJfaWQiOiI1In0.ctB4b7DuJDMOGzwKwVUNZnJ2xmVswtJZHvJLhK7zDOo','2026-07-18 07:44:19.789397','2026-07-25 07:44:19.000000',NULL,'52bd91785d46435597dcb273f82bfbeb'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk2NzI0MiwiaWF0IjoxNzg0MzYyNDQyLCJqdGkiOiJhNjZjZDExZDJmNzg0MDc4Yjg3NWY1OTVmYWRhYTI0NyIsInVzZXJfaWQiOiIxMyJ9.vgaDTqfqoGeQ5mdrooEwvLk_ZbFcT_PlfOqLfUPdryE','2026-07-18 08:14:02.436394','2026-07-25 08:14:02.000000',13,'a66cd11d2f784078b875f595fadaa247'),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3MjA5NywiaWF0IjoxNzg0MzY3Mjk3LCJqdGkiOiI1MWNlZjdmMzM5Yjk0MjVjODEzZWU1NTZmOGMxYTBlZCIsInVzZXJfaWQiOiIxOCJ9.9EERDBN4gPQgJYi9q86OrerKrw_TfjiXsGeYBePvm1o','2026-07-18 09:34:57.869310','2026-07-25 09:34:57.000000',18,'51cef7f339b9425c813ee556f8c1a0ed'),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NTYyMCwiaWF0IjoxNzg0MzcwODIwLCJqdGkiOiI4NTJhYmE2ZjE1NDk0ZWI1OGY3YTNkYjg0MDBlYmFlZSIsInVzZXJfaWQiOiIxOSJ9.Zq2CzLqAENFA1EFED8exd0NikL5B1K1mCMkOLKYDRBY','2026-07-18 10:33:40.704282','2026-07-25 10:33:40.000000',19,'852aba6f15494eb58f7a3db8400ebaee'),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NzMyMywiaWF0IjoxNzg0MzcyNTIzLCJqdGkiOiI0MWM0NjY3MzY2MTc0MTYzYmZhN2RkMzMxM2YyODYxNiIsInVzZXJfaWQiOiIxOSJ9.tYD3FgfWeOkZrv7pnONUwwNpsocPf1EFIEK7vQ8qlkc','2026-07-18 11:02:03.010205','2026-07-25 11:02:03.000000',19,'41c4667366174163bfa7dd3313f28616'),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NzQ1MSwiaWF0IjoxNzg0MzcyNjUxLCJqdGkiOiIwNTYzYTAwNzkyY2U0NjI2ODU0NmViYmRlM2ZlNDM4MyIsInVzZXJfaWQiOiIyMCJ9.TsSUVVBD7fThDRLqaWd-18DNVhgLKRde0c1sY4sxX5s','2026-07-18 11:04:11.003768','2026-07-25 11:04:11.000000',20,'0563a00792ce46268546ebbde3fe4383'),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3NzYwMSwiaWF0IjoxNzg0MzcyODAxLCJqdGkiOiIxYWRmMjI2YWRlZGQ0MmM0YjZlYzFkZjE1YjgzMDE4ZiIsInVzZXJfaWQiOiIyMCJ9.TS69Wn6w1PzAvXYQNAo72LkseqTL9GGlBaaUXPZ_AnM','2026-07-18 11:06:41.868243','2026-07-25 11:06:41.000000',20,'1adf226adedd42c4b6ec1df15b83018f'),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDk3ODE4MiwiaWF0IjoxNzg0MzczMzgyLCJqdGkiOiIxNDE3ZWY3ZjQ0MTg0YzA2YWIzNTQ2ZmUyNGQxYjA5NSIsInVzZXJfaWQiOiIyMCJ9.eH9Nr742v8NWIbUBfZYH5Kd1zCsg5_JronPxQMlXitY','2026-07-18 11:16:22.530979','2026-07-25 11:16:22.000000',20,'1417ef7f44184c06ab3546fe24d1b095'),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyNjgxMiwiaWF0IjoxNzg0NTIyMDEyLCJqdGkiOiJhZjEyZGFjNTA4ZDU0NTkzYTE3OTc0NTQ5ZjM3Mzc2ZSIsInVzZXJfaWQiOiIxOSJ9.BokxV5HfHIEGTSo0J2PxJHSqX27kzqcAPBvV62guB5A','2026-07-20 04:33:32.011693','2026-07-27 04:33:32.000000',19,'af12dac508d54593a17974549f37376e'),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyNzA1NywiaWF0IjoxNzg0NTIyMjU3LCJqdGkiOiI3MGE4NjlkOGRhZmI0YzMxODEwMDdhZWU0ZWVkYzU4OSIsInVzZXJfaWQiOiIxOSJ9.UN-7MVNAtnz3dXT2yTiMRt__dkN5fUWsdd9kOwbQWcs','2026-07-20 04:37:37.423597','2026-07-27 04:37:37.000000',19,'70a869d8dafb4c3181007aee4eedc589'),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyNzU3MywiaWF0IjoxNzg0NTIyNzczLCJqdGkiOiI3MTUyMmU1NDUzOGM0ZDVmYWQ1NTE0MGNlYmEwZWU1ZSIsInVzZXJfaWQiOiIxOSJ9.RPcwXqm4eWQPU-siJ6--QIqeJUuUOa07g35fJ_Y_D10','2026-07-20 04:46:13.250115','2026-07-27 04:46:13.000000',19,'71522e54538c4d5fad55140ceba0ee5e'),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEyOTg4MCwiaWF0IjoxNzg0NTI1MDgwLCJqdGkiOiJkOGYyZmJlNmUxOTI0MGZmYjExMmVmMDNhY2E3YjRmYSIsInVzZXJfaWQiOiIxOSJ9.NIgM06fwGFUjPYeSteCvTZO4_RVRZw8M1-j1ugc8xzc','2026-07-20 05:24:40.053687','2026-07-27 05:24:40.000000',19,'d8f2fbe6e19240ffb112ef03aca7b4fa'),(14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzMTc0NywiaWF0IjoxNzg0NTI2OTQ3LCJqdGkiOiJmMDEyMTBmY2I5NDQ0MzlhYmI0ODVhODRmOTM5OGQ5NyIsInVzZXJfaWQiOiIyMiJ9.9xgba0HEIxTwcaWECsnU-XW5Uh8XyjCtxvy4L5HY7wE','2026-07-20 05:55:47.177055','2026-07-27 05:55:47.000000',22,'f01210fcb944439abb485a84f9398d97'),(15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzMjU5OCwiaWF0IjoxNzg0NTI3Nzk4LCJqdGkiOiIyNWJjYzFlMTBlYjA0NGYzYjdkNWExNzBmODRmMGVhZCIsInVzZXJfaWQiOiIxMCJ9.ceMMexQ4SpwEH4j_8BR5sqf0ADClC-iBdUJcJMKipBg','2026-07-20 06:09:58.637693','2026-07-27 06:09:58.000000',10,'25bcc1e10eb044f3b7d5a170f84f0ead'),(16,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzMjczMywiaWF0IjoxNzg0NTI3OTMzLCJqdGkiOiI0M2I0YjFhZmNjZTM0ZGMxODdjZTljMzExZWE2ZGNkNyIsInVzZXJfaWQiOiIxMSJ9.gJ3ZyIbNQea-W19r3bKO-OD2O9PRRCqCZwaKKp5piHI','2026-07-20 06:12:13.624317','2026-07-27 06:12:13.000000',11,'43b4b1afcce34dc187ce9c311ea6dcd7'),(17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTYyOSwiaWF0IjoxNzg0NTMwODI5LCJqdGkiOiJmZGZiY2QxNGZlZWQ0ZGM5OTUxOGFlYWRhYzRmOTBkNSIsInVzZXJfaWQiOiIxMSJ9.g9gsa8cLumh3oe102__QCncfn66ckRwbmFoEM7CYSUo','2026-07-20 07:00:29.840568','2026-07-27 07:00:29.000000',11,'fdfbcd14feed4dc99518aeadac4f90d5'),(18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTY1MCwiaWF0IjoxNzg0NTMwODUwLCJqdGkiOiI5OTA5ODI0OWM5MDI0ZWE5YTQyMjFjNTNiZTMyOWRmZCIsInVzZXJfaWQiOiIxMSJ9.Kggdqc9goPguyFURPepDI9C3diukE3BEeQupxzeKz4Y','2026-07-20 07:00:50.047442','2026-07-27 07:00:50.000000',11,'99098249c9024ea9a4221c53be329dfd'),(19,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTcyNSwiaWF0IjoxNzg0NTMwOTI1LCJqdGkiOiJlYTZmNDZmZTdhNzc0Yjc2OTkxMWViODcyZGM1MmVjOCIsInVzZXJfaWQiOiIxMSJ9.SBOmB7tjXDAo5tbsl7ZMc3DEdludgSHi6LYEP_JHS_g','2026-07-20 07:02:05.381981','2026-07-27 07:02:05.000000',11,'ea6f46fe7a774b769911eb872dc52ec8'),(20,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NTEzNTc0MCwiaWF0IjoxNzg0NTMwOTQwLCJqdGkiOiIyODE4M2UyMjBkNGE0OWUxYjY5NGFhYzgyMWM0MjQ1MCIsInVzZXJfaWQiOiIxMCJ9.33NJgAOh0Ui1NnTBIg6OUKYbQttuVCxEYlADVIAsCTo','2026-07-20 07:02:20.899594','2026-07-27 07:02:20.000000',10,'28183e220d4a49e1b694aac821c42450');
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'eventfinder_db'
--

--
-- Dumping routines for database 'eventfinder_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-22 10:27:48
