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
  ('B', 4),
  ('B', 5),
  ('B', 6),
  ('B', 7),
  ('B', 8),
  ('B', 9),
  ('B', 10),
  ('B', 21),
  ('C', 1),
  ('C', 3),
  ('C', 200);

INSERT INTO st_ronans_care.Resident (forename, surname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr, roomID)
VALUES
  ('Lionel', 'Lundstrom', '1930-02-03', 'H', '', '', true, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A4')),
  ('Del', 'Devine', '1930-02-03', 'H', '', '', false, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B2')),
  ('Hollis', 'Happ', '1930-02-03', 'S.E', '', '', false, 1, false, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A1')),
  ('Odell', 'Longshore', '1930-02-03', 'H', '', '', true, 2, false, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B3')),
  ('Royce', 'Oberman', '1930-02-03', 'H', '', '', true, 0, false, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'C200')),
  ('Refugio', 'Chausse', '1930-02-03', '', '', '', false, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A201')),
  ('Sylvester', 'Reynoso', '1930-02-03', '', '', '', false, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A2')),
  ('Curtis', 'Calcagno', '1930-02-03', 'H', '', '', false, 1, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A3')),
  ('Buck', 'Brunet', '1930-02-03', 'S.E', '', '', true, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B1')),
  ('Ulysses', 'Umstead', '1930-02-03', 'H', '', '', false, 1, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B21')),
  ('Carmine', 'Christianson', '1930-02-03', 'H', '', '', false, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B5')),
  ('Ivan', 'Ippolito', '1930-02-03', '', '', '', true, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'C1')),
  ('Morris', 'Moss', '1950-02-03', 'H', '', '', false, 1, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B4')),
  ('Edwin', 'Eddison', '1946-07-03', 'S.E', '', '', true, 2, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B6')),
  ('Pepe', 'Marquez', '1947-02-03', 'H', '', '', false, 1, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B7')),
  ('Gordon', 'Underwood', '1935-02-03', 'H', '', '', false, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B9')),
  ('Brook', 'Christie', '1938-02-03', '', '', '', true, 0, true, (SELECT id FROM st_ronans_care.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B10'));

INSERT INTO st_ronans_care.User (username, password, role)
VALUES
	('test1', 'test1', 'Carer'),
    ('test2', 'test2', 'Carer'),
    ('test3', 'test3', 'Carer'),
    ('test4', 'test4', 'Carer');

INSERT INTO st_ronans_care.UserPermission (userID, pmsnID)
VALUES
	((SELECT id FROM st_ronans_care.User WHERE username = 'test1'), 1),
    ((SELECT id FROM st_ronans_care.User WHERE username = 'test1'), 3),
    ((SELECT id FROM st_ronans_care.User WHERE username = 'test2'), 1),
    ((SELECT id FROM st_ronans_care.User WHERE username = 'test3'), 3);

INSERT INTO st_ronans_care.Contact (resID, userID, contactDate, callBell, drinkGiven, description, mood)
VALUES
	((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test2'), '2020-01-14 15:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), 1, '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-01-15 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test2'), '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test3'), '2020-01-14 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test2'), '2020-01-17 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test3'), '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-01-14 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test2'), '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Morris'), (SELECT id FROM st_ronans_care.User WHERE username = 'test3'), '2020-01-13 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-01-13 13:21', 0, 1, 'example description', 'Cheerful'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-01-14 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-01-10 13:21', 0, 1, 'example description', 'Grumpy'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), (SELECT id FROM st_ronans_care.User WHERE username = 'test3'), '2020-01-11 13:21', 0, 1, 'example description', 'Restless'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-01-12 13:21', 0, 1, 'example description', 'Cheerful'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-02-14 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-03-13 13:21', 0, 1, 'example description', 'Grumpy'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-04-14 13:21', 0, 1, 'example description', 'Restless'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-05-13 13:21', 0, 1, 'example description', 'Cheerful'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-05-14 13:21', 0, 1, 'example description', 'Relaxed'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), (SELECT id FROM st_ronans_care.User WHERE username = 'test2'), '2020-05-13 13:21', 0, 1, 'example description', 'Grumpy'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), (SELECT id FROM st_ronans_care.User WHERE username = 'test2'), '2020-05-14 13:21', 0, 1, 'example description', 'Restless'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), (SELECT id FROM st_ronans_care.User WHERE username = 'test3'), '2020-04-14 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-04-14 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-05-14 13:21', 0, 1, 'example description', 'Restless'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-03-14 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), (SELECT id FROM st_ronans_care.User WHERE username = 'test3'), '2020-02-14 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Edwin'), 1, '2020-01-14 13:21', 0, 1, 'example description', 'Restless'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), (SELECT id FROM st_ronans_care.User WHERE username = 'test1'), '2020-05-14 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-03-14 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-05-01 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-05-02 13:21', 0, 1, 'example description', 'Calm'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-05-02 13:21', 0, 1, 'example description', 'Happy'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Gordon'), 1, '2020-05-04 13:21', 0, 1, 'example description', 'Happy'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Pepe'), 1, '2020-05-02 13:21', 0, 1, 'example description', 'Sad'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Pepe'), 1, '2020-05-02 13:21', 0, 1, 'example description', 'Angry'),
    ((SELECT id FROM st_ronans_care.Resident WHERE forename = 'Brook'), 1, '2020-05-04 13:21', 0, 1, 'example description', 'Relaxed');