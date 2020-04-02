DELETE FROM st_ronans_care.Contact WHERE id > 0;
DELETE FROM st_ronans_care.UserPermission WHERE userID > 1;
DELETE FROM st_ronans_care.User WHERE id > 1;
DELETE FROM st_ronans_care.Resident WHERE id > 0;
DELETE FROM st_ronans_care.Room WHERE ID > 0;

INSERT INTO st_ronans_care.Room (roomPrefix, roomNumber)
VALUES
  ('A', 1),
  ('A', 2),
  ('A', 3),
  ('A', 4),
  ('A', 201),
  ('B', 1),
  ('B', 2),
  ('B', 3),
  ('B', 21),
  ('B', 5),
  ('C', 1),
  ('C', 3),
  ('C', 200);

INSERT INTO st_ronans_care.Resident (forename, surname, dietReq, allergies, thickener, diabetes, dnr, roomID)
VALUES
  ('Lionel', 'Lundstrom', '', '', true, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A4')),
  ('Del', 'Devine', '', '', false, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B2')),
  ('Hollis', 'Happ', '', '', false, 1, false, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A1')),
  ('Odell', 'Longshore', '', '', true, 2, false, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B3')),
  ('Royce', 'Oberman', '', '', true, 0, false, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'C200')),
  ('Refugio', 'Chausse', '', '', false, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A201')),
  ('Sylvester', 'Reynoso', '', '', false, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A2')),
  ('Curtis', 'Calcagno', '', '', false, 1, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A3')),
  ('Buck', 'Brunet', '', '', true, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B1')),
  ('Ulysses', 'Umstead', '', '', false, 1, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B21')),
  ('Carmine', 'Christianson', '', '', false, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B5')),
  ('Ivan', 'Ippolito', '', '', true, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'C1'));

INSERT INTO st_ronans_care.User (username, password, role)
VALUES
	('test1', 'test1', 'Carer'),
  ('test2', 'test2', 'Carer'),
  ('test3', 'test3', 'Carer'),
  ('test4', 'test4', 'Carer');

INSERT INTO st_ronans_care.UserPermissions (userID, pmsnID)
VALUES
	((SELECT id FROM st_ronans_care.User WHERE username = 'test1'), 1),
  ((SELECT id FROM st_ronans_care.User WHERE username = 'test1'), 3),
  ((SELECT id FROM st_ronans_care.User WHERE username = 'test2'), 1),
  ((SELECT id FROM st_ronans_care.User WHERE username = 'test3'), 3);
