-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: COP4331
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.1

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
-- Table structure for table `Colors`
--

DROP TABLE IF EXISTS `Colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Colors` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL DEFAULT '',
  `UserID` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `fk_colors_user` (`UserID`),
  CONSTRAINT `fk_colors_user` FOREIGN KEY (`UserID`) REFERENCES `Users` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Colors`
--

LOCK TABLES `Colors` WRITE;
/*!40000 ALTER TABLE `Colors` DISABLE KEYS */;
INSERT INTO `Colors` VALUES (1,'Blue',1),(2,'White',1),(3,'Black',1),(4,'gray',1),(5,'Magenta',1),(6,'Yellow',1),(7,'Cyan',1),(8,'Salmon',1),(9,'Chartreuse',1),(10,'Lime',1),(11,'Light Blue',1),(12,'Light Gray',1),(13,'Light Red',1),(14,'Light Green',1),(15,'Chiffon',1),(16,'Fuscia',1),(17,'Brown',1),(18,'Beige',1),(37,'Aquamarine',1),(42,'Grey',1),(43,'Sky Blue',1),(44,'Blue',7),(45,'Pink',7),(46,'Light Blue',7),(47,'Orange',7),(48,'Maroon',7),(49,'Baby Pink',7),(50,'Sky Blue',1),(51,'Maroon',1);
/*!40000 ALTER TABLE `Colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Contacts`
--

DROP TABLE IF EXISTS `Contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Contacts` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL DEFAULT '',
  `LastName` varchar(50) NOT NULL DEFAULT '',
  `Phone` varchar(50) NOT NULL DEFAULT '',
  `Email` varchar(50) NOT NULL DEFAULT '',
  `UserID` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `fk_contacts_user` (`UserID`),
  CONSTRAINT `fk_contacts_user` FOREIGN KEY (`UserID`) REFERENCES `Users` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Contacts`
--

LOCK TABLES `Contacts` WRITE;
/*!40000 ALTER TABLE `Contacts` DISABLE KEYS */;
INSERT INTO `Contacts` VALUES (1,'Suzy2','Myrtle2','305-965-4321','Suzy2@aol.com',1),(2,'Joe','Jones','407-765-4321','Joe@hotmail.com',1),(3,'Sam','Hill','555-111-2222','sam.hill@example.com',1),(4,'Sophie','Miller','555-222-3333','sophie.m@example.com',1),(5,'Steven','Smith','555-333-4444','steven.smith@example.com',1),(6,'Sara','Lee','555-444-5555','sara.lee@example.com',1),(7,'Sean','Williams','555-555-6666','sean.w@example.com',1),(8,'Silvia','Rodriguez','555-666-7777','silvia.r@example.com',1),(10,'Charlie','Brown','555-777-8888','charlie.brown@example.com',7),(11,'Diana','Prince','555-888-9999','diana.prince@example.com',7),(12,'Bruce','Wayne','555-999-0000','bruce.wayne@example.com',7);
/*!40000 ALTER TABLE `Contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL DEFAULT '',
  `LastName` varchar(50) NOT NULL DEFAULT '',
  `Login` varchar(50) NOT NULL DEFAULT '',
  `Password` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uniq_login` (`Login`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Rick','Leinecker','RickL','5832a71366768098cceb7095efb774f2'),(7,'Sam','Hill','SamH','0cbc6611f5540bd0809a388dc95a615b'),(8,'Alex','Lee','alex','8fe4c11451281c094a6578e6ddbf5eed');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-30 20:37:01
