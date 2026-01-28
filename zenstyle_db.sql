-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: zenstyle_db
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment_details`
--

DROP TABLE IF EXISTS `appointment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointment_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint(20) unsigned NOT NULL,
  `service_id` bigint(20) unsigned NOT NULL,
  `service_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointment_details_appointment_id_foreign` (`appointment_id`),
  KEY `appointment_details_service_id_foreign` (`service_id`),
  CONSTRAINT `appointment_details_appointment_id_foreign` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_details_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_details`
--

LOCK TABLES `appointment_details` WRITE;
/*!40000 ALTER TABLE `appointment_details` DISABLE KEYS */;
INSERT INTO `appointment_details` VALUES (1,1,1,150000.00,'2026-01-22 05:18:31','2026-01-22 05:18:31'),(2,2,5,300000.00,'2026-01-27 05:18:53','2026-01-27 05:18:53'),(3,3,2,500000.00,'2026-01-27 05:33:07','2026-01-27 05:33:07'),(4,4,1,100000.00,'2026-01-27 05:58:56','2026-01-27 05:58:56'),(5,5,2,500000.00,'2026-01-27 06:29:05','2026-01-27 06:29:05'),(6,6,2,500000.00,'2026-01-27 07:44:28','2026-01-27 07:44:28'),(7,7,2,500000.00,'2026-01-27 10:04:03','2026-01-27 10:04:03');
/*!40000 ALTER TABLE `appointment_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `appointment_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint(20) unsigned NOT NULL,
  `staff_id` bigint(20) unsigned NOT NULL,
  `appointment_date` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('Pending','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `appointments_client_id_foreign` (`client_id`),
  KEY `appointments_staff_id_foreign` (`staff_id`),
  CONSTRAINT `appointments_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,3,2,'2026-01-23 10:00:00','2026-01-23 10:30:00','Cancelled',150000.00,NULL,NULL,0.00,0.00,'2026-01-22 05:18:31','2026-01-27 06:31:40'),(2,8,4,'2026-01-28 09:30:00','2026-01-28 10:00:00','Cancelled',300000.00,'toi muon lam som',NULL,0.00,300000.00,'2026-01-27 05:18:53','2026-01-27 05:19:03'),(3,3,4,'2026-01-28 09:30:00','2026-01-28 11:30:00','Completed',500000.00,NULL,NULL,0.00,500000.00,'2026-01-27 05:33:07','2026-01-27 05:33:45'),(4,3,4,'2026-01-28 11:00:00','2026-01-28 11:30:00','Completed',100000.00,NULL,NULL,0.00,100000.00,'2026-01-27 05:58:56','2026-01-27 05:59:15'),(5,3,2,'2026-01-27 16:00:00','2026-01-27 18:00:00','Completed',500000.00,NULL,NULL,0.00,500000.00,'2026-01-27 06:29:05','2026-01-27 06:29:24'),(6,3,2,'2026-01-28 10:00:00','2026-01-28 12:00:00','Completed',500000.00,NULL,'WELCOME10',50000.00,450000.00,'2026-01-27 07:44:28','2026-01-27 07:44:52'),(7,10,2,'2026-01-29 09:00:00','2026-01-29 11:00:00','Pending',500000.00,NULL,'FIXED50K',50000.00,450000.00,'2026-01-27 10:04:03','2026-01-27 10:04:03');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blogs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `author_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Draft','Published','Archived') NOT NULL DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_unique` (`slug`),
  KEY `blogs_author_id_foreign` (`author_id`),
  CONSTRAINT `blogs_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (1,1,'Zenstyle Salon & Spa Officially Open','zenstyle-salon-spa-officially-open','A New Destination for Relaxation and Beauty in the True \"Zen\" Style\r\n\r\nMore than just a beauty salon, Zenstyle Salon & Spa was created with the desire to provide a complete relaxation space – where customers can care for their beauty, rejuvenate their energy, and find balance after a busy life.\r\n\r\nRecently, Zenstyle Salon & Spa officially opened, marking the appearance of a new beauty destination for those who love modern style but still value tranquility and sophistication. From its opening days, Zenstyle has attracted attention thanks to its luxurious space, diverse services, and a customer care philosophy centered on personal experience.\r\n\r\nModern Space, Relaxing Feeling from the First Glance\r\n\r\nDesigned in a modern style combined with a gentle \"Zen\" spirit, Zenstyle offers a warm and comfortable feeling from the moment you step inside. Every detail in the space is carefully considered to create a harmonious blend of aesthetics and comfort, helping customers truly relax throughout their service experience.\r\n\r\nDiverse Services, Professional Team\r\n\r\nZenstyle Salon & Spa offers a wide range of beauty and wellness services, catering to the individual needs of each customer:\r\n\r\nHair styling and care according to trends, suitable for each person\'s unique style.\r\n\r\nIntensive skin care with high-quality, safe, and reputable products.\r\n\r\nRelaxing spa treatments to help the body and mind rest and regenerate energy.\r\n\r\nThe staff at Zenstyle are well-trained, working with dedication and meticulousness, always listening to needs to bring the highest level of satisfaction to customers.\r\n\r\nOperating Philosophy: Customer-Centric\r\n\r\nThe launch of Zenstyle reflects the growing demand from customers for quality personal care services in a warm and comfortable environment. With the motto \"Customer-Centric,\" Zenstyle aims to build a trustworthy beauty destination suitable for both everyday needs and special occasions.\r\n\r\nAttractive opening offers','blogs/BfhxwFXYEcgo61groYjjlEl6YdSWOFNqefXcF0Qr.jpg','Published','2026-01-25 06:25:15','2026-01-27 06:26:02');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-21c7ea48997eeecf541f9afb4a8bfc81','i:2;',1769534530),('laravel-cache-21c7ea48997eeecf541f9afb4a8bfc81:timer','i:1769534530;',1769534530),('laravel-cache-a75f3f172bfb296f2e10cbfc6dfc1883','i:1;',1769534512),('laravel-cache-a75f3f172bfb296f2e10cbfc6dfc1883:timer','i:1769534512;',1769534512),('laravel-cache-d2bfa8e8b749d2772a21edee7b70a2b3','i:7;',1769530090),('laravel-cache-d2bfa8e8b749d2772a21edee7b70a2b3:timer','i:1769530090;',1769530090),('laravel-cache-e45444ecc678a271a6330f468a373360','i:3;',1769533283),('laravel-cache-e45444ecc678a271a6330f468a373360:timer','i:1769533283;',1769533283),('laravel-cache-e9b6cc1432541b9ceebf113eee05eeba','i:1;',1769524885),('laravel-cache-e9b6cc1432541b9ceebf113eee05eeba:timer','i:1769524885;',1769524885),('laravel-cache-f1f70ec40aaa556905d4a030501c0ba4','i:12;',1769534512),('laravel-cache-f1f70ec40aaa556905d4a030501c0ba4:timer','i:1769534512;',1769534512),('laravel-cache-salon_setting_capacity_warning_threshold','i:80;',1769537043),('laravel-cache-salon_setting_currency_code','s:3:\"VND\";',1769536740),('laravel-cache-salon_setting_currency_fraction_digits','i:0;',1769536740),('laravel-cache-salon_setting_currency_locale','s:5:\"vi-VN\";',1769536740),('laravel-cache-salon_setting_enable_capacity_check','b:1;',1769537043),('laravel-cache-salon_setting_max_concurrent_appointments','i:5;',1769536740),('laravel-cache-salon_setting_max_daily_appointments','i:30;',1769536740),('laravel-cache-salon_setting_working_hours_end','s:5:\"18:00\";',1769536740),('laravel-cache-salon_setting_working_hours_start','s:5:\"09:00\";',1769536740);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contacts` (
  `contact_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('New','Read','Replied','Resolved') NOT NULL DEFAULT 'New',
  `admin_reply` text DEFAULT NULL,
  `replied_by` bigint(20) unsigned DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`contact_id`),
  KEY `contacts_replied_by_foreign` (`replied_by`),
  CONSTRAINT `contacts_replied_by_foreign` FOREIGN KEY (`replied_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedbacks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint(20) unsigned DEFAULT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `feedback_type` enum('appointment','order') NOT NULL DEFAULT 'appointment',
  `rating` int(11) NOT NULL,
  `service_quality_rating` int(11) DEFAULT NULL COMMENT 'Rating for service quality (1-5)',
  `staff_friendliness_rating` int(11) DEFAULT NULL COMMENT 'Rating for staff friendliness (1-5)',
  `cleanliness_rating` int(11) DEFAULT NULL COMMENT 'Rating for cleanliness (1-5)',
  `value_for_money_rating` int(11) DEFAULT NULL COMMENT 'Rating for value for money (1-5)',
  `comments` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `feedbacks_appointment_id_foreign` (`appointment_id`),
  KEY `feedbacks_order_id_foreign` (`order_id`),
  KEY `feedbacks_user_id_foreign` (`user_id`),
  CONSTRAINT `feedbacks_appointment_id_foreign` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
INSERT INTO `feedbacks` VALUES (1,5,NULL,NULL,'appointment',5,5,5,5,5,'okay','2026-01-27 06:52:13','2026-01-27 06:52:13'),(2,3,NULL,NULL,'appointment',5,5,5,5,5,'sfsdfsdf','2026-01-27 07:45:21','2026-01-27 07:45:21');
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2026_01_12_160638_create_personal_access_tokens_table',1),(4,'2026_01_12_200242_create_all_tables',1),(5,'2026_01_13_145148_create_sessions_table',1),(6,'2026_01_13_183924_create_appointments_table',1),(7,'2026_01_14_160747_create_blogs_and_feedbacks_table',1),(8,'2026_01_14_185354_create_orders_table',1),(9,'2026_01_14_201819_add_image_to_products_and_services_tables',1),(10,'2026_01_14_202143_add_avatar_to_users_table',1),(11,'2026_01_15_100000_add_is_active_to_users_table',1),(12,'2026_01_16_000000_create_contacts_table',1),(13,'2026_01_16_100000_add_image_to_services_table',1),(14,'2026_01_16_110000_add_description_to_products_table',1),(15,'2026_01_16_211036_add_image_to_blogs_table',1),(16,'2026_01_16_225817_add_payment_fields_to_orders_table',1),(17,'2026_01_17_000000_create_salon_settings_table',2),(18,'2026_01_17_100000_create_password_reset_tokens_table',2),(19,'2026_01_19_000000_add_discount_fields_to_orders_table',2),(21,'2026_01_19_000001_add_discount_fields_to_appointments_table',3),(22,'2026_01_22_114035_add_payment_and_coupon_fields_to_orders_table',3),(23,'2026_01_27_123815_add_order_support_to_feedbacks_table',4),(24,'2026_01_27_131919_add_service_ratings_to_feedbacks_table',4);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_details_order_id_foreign` (`order_id`),
  KEY `order_details_product_id_foreign` (`product_id`),
  CONSTRAINT `order_details_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,3,1,3,250000.00,750000.00,'2026-01-22 04:46:43','2026-01-22 04:46:43'),(2,4,6,1,450000.00,450000.00,'2026-01-25 02:32:40','2026-01-25 02:32:40');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint(20) unsigned NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(255) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','Processing','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_method` enum('COD','VNPay','MoMo','BankTransfer') NOT NULL DEFAULT 'COD',
  `payment_status` enum('Unpaid','Paid','Refunded') NOT NULL DEFAULT 'Unpaid',
  `payment_transaction_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_client_id_foreign` (`client_id`),
  CONSTRAINT `orders_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (3,3,750000.00,NULL,0.00,750000.00,'Processing','COD','Paid',NULL,'2026-01-27 05:57:20',NULL,NULL,NULL,'2026-01-22 04:46:43','2026-01-27 05:57:20'),(4,5,450000.00,'WELCOME10',45000.00,405000.00,'Pending','COD','Unpaid',NULL,NULL,NULL,NULL,NULL,'2026-01-25 02:32:40','2026-01-25 02:32:40');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`),
  KEY `password_reset_tokens_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (20,'App\\Models\\User',6,'auth_token','f9f1f1593d41aed6e0ea992a974aca7d7321136f1abc8722c486354ebace4390','[\"*\"]',NULL,NULL,'2026-01-25 03:57:23','2026-01-25 03:57:23'),(25,'App\\Models\\User',7,'auth_token','23924098edb4d087368ad2e1815808a17791e5354bd4cff46f6dabd035e74928','[\"*\"]',NULL,NULL,'2026-01-25 06:18:36','2026-01-25 06:18:36'),(39,'App\\Models\\User',9,'auth_token','4d16ffb9aafc0733d3182d9dcbac926d24c0025f57c8ad3a9ee3d989c18b9489','[\"*\"]',NULL,NULL,'2026-01-27 06:08:31','2026-01-27 06:08:31'),(49,'App\\Models\\User',1,'auth_token','6bdac887230d610ea940c8d0859ec4f66387a8f052ecb25d39ef6c3a3a3674ce','[\"*\"]','2026-01-27 10:21:32',NULL,'2026-01-27 10:00:24','2026-01-27 10:21:32'),(50,'App\\Models\\User',10,'auth_token','a8e599d9c71cab7305d7edaf2e6b52762b1088136a4461f12a9aec1f405a8b4c','[\"*\"]','2026-01-27 10:21:18',NULL,'2026-01-27 10:00:56','2026-01-27 10:21:18');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Herbal Shampoo','Retail','products/Atop6oBVBhYjeY0RpqV0kCF9Zmp4ytIUaD9ElVVO.png',NULL,47,250000.00,'2026-01-17 03:17:23','2026-01-25 01:30:19'),(2,'Hair Repair Conditioners','Retail','products/hvOap4rV15N0oK9nHrK1GiUbWeXRah4CptXG7XQF.jpg',NULL,50,500000.00,'2026-01-25 01:30:05','2026-01-25 01:57:23'),(4,'Hair Oil With Natural Flower Essential','Retail','products/18fc10f2-40ff-4cfa-ba48-da9515426e28.jpg',NULL,50,700000.00,'2026-01-25 01:54:43','2026-01-25 01:54:43'),(5,'5-in-1 Comprehensive and Intensive Skincare Combo','Retail','products/K9jauElkKqiyfiZtywsQJa4N05VvktcHlLtbEOK9.jpg',NULL,20,1200000.00,'2026-01-25 02:05:54','2026-01-25 02:05:54'),(6,'Zen Hair Wax For Men','Retail','products/cae058d1-962b-4a56-b98c-ac6cf600095f.jpg',NULL,49,450000.00,'2026-01-25 02:08:05','2026-01-25 02:32:40');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_settings`
--

DROP TABLE IF EXISTS `salon_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salon_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'string',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `salon_settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_settings`
--

LOCK TABLES `salon_settings` WRITE;
/*!40000 ALTER TABLE `salon_settings` DISABLE KEYS */;
INSERT INTO `salon_settings` VALUES (1,'max_concurrent_appointments','5','integer','Maximum number of concurrent appointments (salon capacity - number of service stations/chairs)','2026-01-22 01:53:38','2026-01-22 01:53:38'),(2,'max_daily_appointments','30','integer','Maximum number of appointments per day','2026-01-22 01:53:38','2026-01-22 01:53:38'),(3,'working_hours_start','09:00','string','Salon opening time','2026-01-22 01:53:38','2026-01-22 01:53:38'),(4,'working_hours_end','18:00','string','Salon closing time','2026-01-22 01:53:38','2026-01-22 01:53:38'),(5,'enable_capacity_check','true','boolean','Enable salon capacity checking','2026-01-22 01:53:38','2026-01-22 01:53:38'),(6,'capacity_warning_threshold','80','integer','Show warning when capacity reaches this percentage','2026-01-22 01:53:38','2026-01-22 01:53:38'),(7,'enable_waiting_list','false','boolean','Enable waiting list when salon is at full capacity','2026-01-22 01:53:38','2026-01-22 01:53:38');
/*!40000 ALTER TABLE `salon_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'ZenStyle Haircut',100000.00,30,'Hair','services/75efa331-38a1-4787-a765-d1a672bf097e.png','Enjoy all the benefits of our classic haircut PLUS a customized Kerastase Fusio Dose conditioning treatment to target your hair concerns.','2026-01-17 03:17:23','2026-01-25 05:17:26'),(2,'Nourishing Hair Wash',500000.00,120,'Spa','services/t77oEmeFKpFQJW3kxiXYv3SsPilhTmFgGqL2oogw.jpg','At ZenStyle, we believe that true health and beauty begin with peace of mind.\r\nEach nourishing shampoo session not only helps to soften hair and clean, healthy scalp, but also releases tension accumulated in the head, neck, shoulders and nape - places considered the center of life energy (\"blood circulation, relaxed mind\").','2026-01-17 03:17:23','2026-01-25 05:08:20'),(5,'Nails',300000.00,30,'Nails','services/VsOziuV6JKM1fUwrM2ce45qjsOlctTZXd1YQG8b2.jpg','Restore and maintain the health of your nails with natural, paraben free, and 5-free nail treatments. We do natural nails and are unable to remove gel, shellac or acrylic. This allows us to provide a safe and welcoming environment for those with chemical sensitivities.','2026-01-25 05:11:48','2026-01-25 05:11:48');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('SLTp55LT5ml69UKqYNCfWDtJwvjEYQs97nJwya4c',NULL,'127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoieTZCdWZPRVFKUnM1QUNyZGQ2OHVxM0xlYWpXNUlXc1BwMVk5WHptNiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1768646073),('Ywj0euSgFYVx51pVBOhZIb9j0y4Q2QO8xHgj6aXX',NULL,'127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMnZZVTQwRnhMaUtPcjRJcldoNDllMkxaMUZkSjg5Y0t5NW1ocGN1NiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1768645937);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Stylist','Client') NOT NULL DEFAULT 'Client',
  `phone_number` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `avatar` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin','admin@zenstyle.com','$2y$12$c1VV/9xN8hdamXM3DhUU6uUFfH.VqiD7smu8oOOkCOuZ1GTciBEd.','Admin','0909094449',1,NULL,NULL,'2026-01-17 03:17:23','2026-01-22 05:58:44'),(2,'Minh Stylist','minh','minh@zenstyle.com','$2y$12$jxe6j3OoB2HW/fkgcFFF2.7Gr3yx3u3oQmhsnZRJpw0ygRb5zYHH2','Stylist','0909123456',1,NULL,NULL,'2026-01-17 03:17:23','2026-01-22 05:52:56'),(3,'Client Demo','client','client@example.com','$2y$12$Vv1b0n0HHoNTlt9ht6ocKe/p.S6GJqqp3H.qAXxvTkPuqsotUf.G2','Client',NULL,1,NULL,NULL,'2026-01-17 03:17:23','2026-01-27 05:32:14'),(4,'Tuan','tuanstaff','tuan@zenstyle.com','$2y$12$t.nqnONCTIxBMP9AiyUT0.5IMCXIedW0PIm4nuYyD7E3DrOja9mHu','Stylist','0936782339',1,NULL,NULL,'2026-01-22 05:53:47','2026-01-22 05:53:47'),(5,'tele','tele','nguduw@gmail.com','$2y$12$RuAgG2REIckIPjnkDcxnuejB./9C23Qz.0ewuo948nprMB4VdnxQW','Client','0909090911',1,NULL,NULL,'2026-01-25 02:28:53','2026-01-25 02:28:53'),(6,'johndoe41198','johndoe41198','autotest1769338641198-2@example.com','$2y$12$4kagWBiSt/7RS.LRPBFK3eqXJaxHUJXd9uW/w2mjcVxN.k63s4qDG','Client','0901234567',1,NULL,NULL,'2026-01-25 03:57:23','2026-01-25 03:57:23'),(7,'validuser2','validuser2','valid@example.com','$2y$12$XJbldk2DRgYTPHYtfzD/suwqxE3f59FqJaSGmuj77kwejHBx6TyKG','Client','0901234567',1,NULL,NULL,'2026-01-25 06:18:36','2026-01-25 06:18:36'),(8,'aka1','aka1','aka1@gmail.com','$2y$12$KxbmLHovjPiGTsOYoWyKKuyq4k.PU3Ij.F5P1/v.6RvC.SRZjn6pm','Client','0909123456',1,NULL,NULL,'2026-01-27 03:36:41','2026-01-27 03:36:41'),(9,'ttsafasfsfs','ttsafasfsfs','test2@gmail.com','$2y$12$/hCt9R1ykFwf9ZM7VnUhru/qT/k0GYdrHvG/Zr90M7K3qIhyLz3wC','Client','0905070044',1,NULL,NULL,'2026-01-27 06:08:31','2026-01-27 06:08:31'),(10,'test1','test1','test@gmail.com','$2y$12$Fcw2rHInp0dGnIFG0jbB9.bj84lCnyfFuxB.3viy/z5K5rtfzvP5C','Client','0905070044',1,NULL,NULL,'2026-01-27 06:10:15','2026-01-27 06:10:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-28  0:30:04
