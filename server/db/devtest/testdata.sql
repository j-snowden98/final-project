INSERT INTO st_ronans_care.Resident (forename, surname, dietReq, allergies, thickener, diabetes, dnr)
VALUES
  ('TestF1', 'TestS1', '', '', true, 2, true),
  ('TestF2', 'TestS2', '', '', false, 0, true),
  ('TestF3', 'TestS3', '', '', false, 1, false),
  ('TestF4', 'TestS4', '', '', true, 2, false),
  ('TestF5', 'TestS5', '', '', true, 0, false),
  ('TestF6', 'TestS6', '', '', false, 2, true);

INSERT INTO st_ronans_care.Room (roomName)
VALUES
  ('A1'),
  ('A2'),
  ('A3'),
  ('A4'),
  ('A201'),
  ('B1'),
  ('B2'),
  ('B3'),
  ('B21'),
  ('B5'),
  ('C1'),
  ('C3'),
  ('C200');

INSERT INTO st_ronans_care.ResidentRoom (resID, roomID)
VALUES
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'TestS1'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'A4')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'TestS2'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'B2')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'TestS3'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'A1')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'TestS4'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'B3')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'TestS5'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'C200')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'TestS6'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'A201'));
