CREATE DATABASE IF NOT EXISTS st_ronans_care_test;

CREATE TABLE IF NOT EXISTS st_ronans_care_test.User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100),
  password VARCHAR(100),
  role VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS st_ronans_care_test.Permissions (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type INT NOT NULL
);

CREATE TABLE IF NOT EXISTS st_ronans_care_test.UserPermissions (
  userID INT NOT NULL,
  pmsnID INT NOT NULL,
  FOREIGN KEY (userID) REFERENCES User(id),
  FOREIGN KEY (pmsnID) REFERENCES Permissions(id)
);

CREATE TABLE IF NOT EXISTS st_ronans_care_test.Resident (
  id INT PRIMARY KEY AUTO_INCREMENT,
  forename VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  dietReq VARCHAR(100) NOT NULL,
  allergies VARCHAR(100) NOT NULL,
  thickener BOOLEAN NOT NULL,
  diabetes TINYINT(1) NOT NULL,
  dnr BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS st_ronans_care_test.Room (
  id INT PRIMARY KEY AUTO_INCREMENT,
  roomPrefix VARCHAR(4) NOT NULL,
  roomNumber INT NOT NULL
);

CREATE TABLE IF NOT EXISTS st_ronans_care_test.ResidentRoom (
  resID INT NOT NULL,
  roomID INT NOT NULL,
  FOREIGN KEY (resID) REFERENCES Resident(id),
  FOREIGN KEY (roomID) REFERENCES Room(id)
);

CREATE TABLE IF NOT EXISTS st_ronans_care_test.Contact (
  id INT PRIMARY KEY AUTO_INCREMENT,
  resID INT NOT NULL,
  userID INT NOT NULL,
  contactDate DATETIME NOT NULL,
  callBell BOOLEAN NOT NULL,
  drinkGiven BOOLEAN NOT NULL,
  description TEXT NOT NULL,
  mood TEXT NOT NULL,
  FOREIGN KEY (resID) REFERENCES Resident(id),
  FOREIGN KEY (userID) REFERENCES User(id)
);
