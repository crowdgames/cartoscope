-- MySQL dump 10.13  Distrib 5.7.38, for Linux (x86_64)
--
-- Host: localhost    Database: convergeDB
-- ------------------------------------------------------
-- Server version	5.7.38-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about_info`
--

DROP TABLE IF EXISTS `about_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `about_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `creator` int(11) DEFAULT '0',
  `description` text,
  `link` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cartoscope_cairns`
--

DROP TABLE IF EXISTS `cartoscope_cairns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cartoscope_cairns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `project_id` varchar(128) DEFAULT NULL,
  `hit_id` varchar(128) DEFAULT NULL,
  `cairn_type` varchar(128) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `message` text,
  `time_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `time_shown_to_player` timestamp NULL DEFAULT NULL,
  `time_player_submitted` timestamp NULL DEFAULT NULL,
  `task_name` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`user_id`,`project_id`,`level_number`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `downloadStatus`
--

DROP TABLE IF EXISTS `downloadStatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `downloadStatus` (
  `id` varchar(54) NOT NULL,
  `status` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `featured_url_route`
--

DROP TABLE IF EXISTS `featured_url_route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `featured_url_route` (
  `id` int(11) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `active_from` datetime DEFAULT CURRENT_TIMESTAMP,
  `active_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `flag_image`
--

DROP TABLE IF EXISTS `flag_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flag_image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) NOT NULL,
  `project_id` varchar(128) NOT NULL,
  `task_id` varchar(128) NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genetic_tree`
--

DROP TABLE IF EXISTS `genetic_tree`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genetic_tree` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code_main` varchar(255) DEFAULT NULL,
  `active` int(11) DEFAULT '0',
  `parent` varchar(255) DEFAULT NULL,
  `node` varchar(255) DEFAULT NULL,
  `label_project` varchar(255) DEFAULT NULL,
  `map_project` varchar(255) DEFAULT NULL,
  `marker_project` varchar(255) DEFAULT NULL,
  `progress_type` varchar(255) DEFAULT NULL,
  `fitness_function` float DEFAULT NULL,
  `fitness_function_mean` float DEFAULT NULL,
  `people` int(11) DEFAULT '0',
  `ignore_codes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code_main` (`unique_code_main`,`node`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hub_projects`
--

DROP TABLE IF EXISTS `hub_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hub_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creatorID` int(11) DEFAULT NULL,
  `cover_pic` varchar(255) DEFAULT NULL,
  `name` varchar(512) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  `short_description` varchar(2048) DEFAULT NULL,
  `url_name` varchar(512) DEFAULT NULL,
  `video_url` varchar(2048) DEFAULT NULL,
  `hub_unique_code` varchar(255) DEFAULT NULL,
  `published` int(11) DEFAULT '0',
  `access_type` int(11) DEFAULT '0',
  `external_sign_up` text,
  `scistarter_link` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_codes` varchar(512) DEFAULT NULL,
  `dataset_ids` text,
  `results_labels` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_name_UNIQUE` (`url_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inaturalist_reports`
--

DROP TABLE IF EXISTS `inaturalist_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inaturalist_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(128) DEFAULT NULL,
  `user_id` varchar(128) DEFAULT NULL,
  `unique_code` varchar(128) DEFAULT NULL,
  `dataset_id` varchar(128) DEFAULT NULL,
  `image_name` varchar(128) DEFAULT NULL,
  `category` varchar(128) DEFAULT NULL,
  `observation_id` int(11) DEFAULT NULL,
  `taxon_id` int(11) DEFAULT NULL,
  `identification_id` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kiosk_workers`
--

DROP TABLE IF EXISTS `kiosk_workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kiosk_workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workerID` varchar(128) NOT NULL,
  `projectID` varchar(128) DEFAULT NULL,
  `consented` int(11) DEFAULT '1',
  `cookieID` varchar(120) DEFAULT NULL,
  `hitID` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`workerID`,`projectID`)
) ENGINE=InnoDB AUTO_INCREMENT=1013 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mturk_workers`
--

DROP TABLE IF EXISTS `mturk_workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mturk_workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workerID` varchar(128) NOT NULL,
  `projectID` varchar(128) DEFAULT NULL,
  `assignmentID` varchar(128) DEFAULT NULL,
  `hitID` varchar(128) DEFAULT NULL,
  `submitTo` varchar(128) DEFAULT NULL,
  `siteID` varchar(128) DEFAULT '1',
  `consented` int(11) DEFAULT '1',
  `hit_code` varchar(128) DEFAULT NULL,
  `genetic_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`workerID`,`projectID`,`hitID`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password`
--

DROP TABLE IF EXISTS `password`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password` (
  `id` int(11) NOT NULL,
  `salt` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  CONSTRAINT `id` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progress` (
  `progress_id` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(256) NOT NULL,
  `project_id` varchar(45) NOT NULL,
  `progress` int(11) DEFAULT '0',
  `user_type` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`progress_id`),
  UNIQUE KEY `Unique` (`id`,`project_id`)
) ENGINE=InnoDB AUTO_INCREMENT=947 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_admins`
--

DROP TABLE IF EXISTS `project_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_admins` (
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `level` int(11) DEFAULT '1',
  UNIQUE KEY `index1` (`user_id`,`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creatorID` int(11) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  `short_description` varchar(2048) DEFAULT NULL,
  `cover_pic` varchar(255) DEFAULT NULL,
  `access_type` int(11) DEFAULT '0',
  `unique_code` varchar(255) DEFAULT NULL,
  `template` text,
  `name` varchar(512) DEFAULT NULL,
  `short_name` varchar(512) DEFAULT NULL,
  `short_name_friendly` varchar(2048) DEFAULT NULL,
  `published` int(11) DEFAULT '0',
  `dataset_id` varchar(45) DEFAULT NULL,
  `archived` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `flight_path` int(11) DEFAULT '0',
  `point_selection` int(11) DEFAULT '0',
  `points_file` varchar(255) DEFAULT NULL,
  `inorder` int(11) DEFAULT '0',
  `req_count` int(11) DEFAULT '0',
  `image_source` text,
  `image_attribution` text,
  `ar_ready` int(11) DEFAULT '0',
  `ar_status` int(11) DEFAULT '0',
  `tutorial_link` text,
  `genetic` int(11) DEFAULT '0',
  `genetic_task` int(11) DEFAULT '0',
  `has_location` int(11) DEFAULT '1',
  `is_inaturalist` int(11) DEFAULT '0',
  `has_survey` int(11) DEFAULT '1',
  `survey_type` varchar(255) DEFAULT 'IMI',
  `poi_name` text,
  `video_url` varchar(2048) DEFAULT NULL,
  `slider_text` text,
  `external_sign_up` text,
  `ngs_zoom` int(11) DEFAULT NULL,
  `show_cairns` int(11) DEFAULT '0',
  `scistarter_link` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code_UNIQUE` (`unique_code`),
  KEY `Creator_idx` (`creatorID`),
  CONSTRAINT `Creator` FOREIGN KEY (`creatorID`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `response`
--

DROP TABLE IF EXISTS `response`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `response` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) NOT NULL,
  `project_id` varchar(128) NOT NULL,
  `task_id` varchar(128) NOT NULL,
  `site_id` int(11) DEFAULT '1',
  `response` int(11) NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `center_lat` varchar(50) DEFAULT NULL,
  `center_lon` varchar(50) DEFAULT NULL,
  `response_text` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4823 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `survey`
--

DROP TABLE IF EXISTS `survey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `survey` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `response` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `hitID` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`user_id`,`project_id`)
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `survey_questions`
--

DROP TABLE IF EXISTS `survey_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code` varchar(255) DEFAULT NULL,
  `survey_form` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code_UNIQUE` (`unique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_genetic_sequences`
--

DROP TABLE IF EXISTS `task_genetic_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_genetic_sequences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code_main` varchar(255) DEFAULT NULL,
  `seq` text,
  `active` int(11) DEFAULT '0',
  `label_project` varchar(255) DEFAULT NULL,
  `map_project` varchar(255) DEFAULT NULL,
  `marker_project` varchar(255) DEFAULT NULL,
  `progress_type` varchar(255) DEFAULT NULL,
  `fitness_function` float DEFAULT NULL,
  `fitness_function2` float DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `generated_from` varchar(255) DEFAULT NULL,
  `ignore_codes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_ar_actions`
--

DROP TABLE IF EXISTS `tileoscope_ar_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_ar_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(128) DEFAULT NULL,
  `short_name` varchar(128) DEFAULT NULL,
  `action` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_cairns`
--

DROP TABLE IF EXISTS `tileoscope_cairns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_cairns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `hit_id` varchar(128) DEFAULT NULL,
  `level_id` varchar(255) DEFAULT NULL,
  `level_number` int(11) DEFAULT NULL,
  `message` text,
  `time_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`user_id`,`level_id`,`level_number`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_genetic_tree`
--

DROP TABLE IF EXISTS `tileoscope_genetic_tree`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_genetic_tree` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code_main` varchar(255) DEFAULT NULL,
  `active` int(11) DEFAULT '0',
  `parent` text,
  `node` text,
  `pool` text,
  `misc` varchar(255) DEFAULT NULL,
  `fitness_function` float DEFAULT NULL,
  `fitness_function_mean` float DEFAULT NULL,
  `people` int(11) DEFAULT '0',
  `ignore_codes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_moves`
--

DROP TABLE IF EXISTS `tileoscope_moves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_moves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `hit_id` varchar(128) DEFAULT NULL,
  `response` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_paths`
--

DROP TABLE IF EXISTS `tileoscope_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_paths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `hit_id` varchar(128) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `unique_code_main` varchar(255) DEFAULT NULL,
  `seq` text,
  `user_index` int(11) DEFAULT '0',
  `user_quit` int(11) DEFAULT '0',
  `tiles_collected` text,
  `times_completed` text,
  `number_moves` text,
  `number_mistakes` text,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`user_id`,`hit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_qtable`
--

DROP TABLE IF EXISTS `tileoscope_qtable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_qtable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code_main` varchar(128) DEFAULT NULL,
  `q_action` varchar(255) DEFAULT NULL,
  `q_state` text,
  `q_player_mistakes` varchar(128) DEFAULT NULL,
  `q_value` float DEFAULT NULL,
  `mode` varchar(128) DEFAULT 'adaptive',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_survey`
--

DROP TABLE IF EXISTS `tileoscope_survey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_survey` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `hit_id` varchar(128) DEFAULT NULL,
  `response` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`user_id`,`hit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tileoscope_task_genetic_sequences`
--

DROP TABLE IF EXISTS `tileoscope_task_genetic_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tileoscope_task_genetic_sequences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code_main` varchar(255) DEFAULT NULL,
  `seq` text,
  `active` int(11) DEFAULT '0',
  `pool` text,
  `misc` varchar(255) DEFAULT NULL,
  `fitness_function` float DEFAULT NULL,
  `fitness_function2` float DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `generated_from` varchar(255) DEFAULT NULL,
  `ignore_codes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tree_forced`
--

DROP TABLE IF EXISTS `tree_forced`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tree_forced` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code_main` varchar(255) DEFAULT NULL,
  `active` int(11) DEFAULT '1',
  `subsequence` varchar(255) DEFAULT NULL,
  `sub_size` int(11) DEFAULT '0',
  `assigned` int(11) DEFAULT '0',
  `satisfied` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code_main` (`unique_code_main`,`subsequence`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tutorial`
--

DROP TABLE IF EXISTS `tutorial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutorial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code` varchar(255) DEFAULT NULL,
  `point_selection` int(11) DEFAULT '0',
  `points_file` varchar(255) DEFAULT NULL,
  `poi_name` varchar(255) DEFAULT NULL,
  `template` text,
  `image_name` varchar(255) DEFAULT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `explanation` text,
  `x` varchar(45) DEFAULT NULL,
  `y` varchar(45) DEFAULT NULL,
  `zoom` varchar(45) DEFAULT NULL,
  `image_source` text,
  `image_attribution` text,
  `in_dataset` int(11) DEFAULT '0',
  `image_annotation` varchar(255) DEFAULT '0',
  `ask_user` int(11) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tutorial_sequences`
--

DROP TABLE IF EXISTS `tutorial_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutorial_sequences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_code` varchar(255) DEFAULT NULL,
  `seq` text,
  `active` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tutorial_users`
--

DROP TABLE IF EXISTS `tutorial_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutorial_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workerID` varchar(128) NOT NULL,
  `unique_code` varchar(128) DEFAULT NULL,
  `hitID` varchar(128) DEFAULT NULL,
  `seq` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8 NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `agree_mail` tinyint(4) DEFAULT '0',
  `agree_help` tinyint(1) DEFAULT '0',
  `approved` tinyint(1) DEFAULT '0',
  `profile_photo` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `short_bio` text,
  `is_creator` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idusers_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `worker_params`
--

DROP TABLE IF EXISTS `worker_params`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `worker_params` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workerID` varchar(128) NOT NULL,
  `params` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-06-25 23:05:59
