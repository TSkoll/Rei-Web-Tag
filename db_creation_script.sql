-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema rei
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema rei
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `rei` DEFAULT CHARACTER SET utf8 ;
USE `rei` ;

-- -----------------------------------------------------
-- Table `rei`.`tag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rei`.`tag` (
  `id` INT UNSIGNED NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `userid` VARCHAR(32) NOT NULL,
  `content` VARCHAR(2024) NULL,
  `file` VARCHAR(32) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rei`.`apikey`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rei`.`apikey` (
  `id` INT UNSIGNED NULL AUTO_INCREMENT,
  `key` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
