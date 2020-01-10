create database if not exists st_ronans_care;

CREATE TABLE IF NOT EXISTS st_ronans_care.User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100),
  password VARCHAR(100),
  role VARCHAR(100)
);

CREATE TABLE st_ronans_care.Permissions (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type INT NOT NULL
)

CREATE TABLE IF NOT EXISTS st_ronans_care.UserPermissions (
  userID INT NOT NULL,
  pmsnID INT NOT NULL,
  FOREIGN KEY (userID) REFERENCES User(id),
  FOREIGN KEY (pmsnID) REFERENCES Permissions(id)
);

CREATE TABLE IF NOT EXISTS st_ronans_care.Resident (
  id INT PRIMARY KEY AUTO_INCREMENT,
  forename VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  dietReq VARCHAR(100) NOT NULL,
  allergies VARCHAR(100) NOT NULL,
  thickener BOOLEAN NOT NULL,
  diabetes TINYINT(1) NOT NULL,
  dnr BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS st_ronans_care.Room (
  id INT PRIMARY KEY AUTO_INCREMENT,
  roomPrefix VARCHAR NOT NULL,
  roomNumber INT NOT NULL
);

CREATE TABLE IF NOT EXISTS st_ronans_care.ResidentRoom (
  resID INT NOT NULL,
  roomID INT NOT NULL,
  FOREIGN KEY (resID) REFERENCES Resident(id),
  FOREIGN KEY (roomID) REFERENCES Room(id)
);

CREATE TABLE IF NOT EXISTS st_ronans_care.Contact (
  id INT PRIMARY KEY AUTO_INCREMENT,
  resID INT NOT NULL,
  userID INT NOT NULL,
  contactDate DATETIME NOT NULL,
  callBell BOOLEAN NOT NULL,
  drinkGiven BOOLEAN NOT NULL,
  description TEXT,
  FOREIGN KEY (resID) REFERENCES Resident(id),
  FOREIGN KEY (userID) REFERENCES User(id)
);

INSERT INTO st_ronans_care.User (username, password, role)
VALUES
    ('j-snowden', '$2a$10$cz4RgHPRI2xfd4jqn2vXFeJfThfcHqtITtLWKkgeSLPn4WjGUU5eG', 'Administrator');
