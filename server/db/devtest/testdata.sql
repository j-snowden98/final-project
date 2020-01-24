INSERT INTO st_ronans_care_test.Resident (forename, surname, dietReq, allergies, thickener, diabetes, dnr)
VALUES
  ('Lionel', 'Lundstrom', '', '', true, 2, true),
  ('Del', 'Devine', '', '', false, 0, true),
  ('Hollis', 'Happ', '', '', false, 1, false),
  ('Odell', 'Longshore', '', '', true, 2, false),
  ('Royce', 'Oberman', '', '', true, 0, false),
  ('Refugio', 'Chausse', '', '', false, 2, true),
  ('Sylvester', 'Reynoso', '', '', false, 2, true),
  ('Curtis', 'Calcagno', '', '', false, 1, true),
  ('Buck', 'Brunet', '', '', true, 2, true),
  ('Ulysses', 'Umstead', '', '', false, 1, true),
  ('Carmine', 'Christianson', '', '', false, 0, true),
  ('Ivan', 'Ippolito', '', '', true, 0, true);


INSERT INTO st_ronans_care_test.Room (roomPrefix, roomNumber)
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

INSERT INTO st_ronans_care_test.ResidentRoom (resID, roomID)
VALUES
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Lundstrom'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A4')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Devine'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B2')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Happ'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A1')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Longshore'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B3')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Oberman'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'C200')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Chausse'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A201')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Reynoso'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A2')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Calcagno'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'A3')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Brunet'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B1')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Umstead'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B21')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Christianson'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'B5')),
  ((SELECT id FROM st_ronans_care_test.Resident WHERE surname = 'Ippolito'), (SELECT id FROM st_ronans_care_test.Room WHERE CONCAT(roomPrefix, roomNumber) = 'C1'));
