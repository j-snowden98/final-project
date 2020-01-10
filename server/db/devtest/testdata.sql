INSERT INTO st_ronans_care.Resident (forename, surname, dietReq, allergies, thickener)
VALUES
  ('Steve', 'Test1', '', '', true),
  ('Larry', 'Test2', '', '', true),
  ('Bob', 'Test3', '', '', true),
  ('Barry', 'Test4', '', '', true),
  ('Sally', 'Test5', '', '', true),
  ('Ethel', 'Test6', '', '', true);

INSERT INTO st_ronans_care.Room (roomName)
VALUES
  ('Room 1'),
  ('Room 2'),
  ('Room 3'),
  ('Room 4'),
  ('Room 5'),
  ('Room 6'),
  ('Room 7'),
  ('Room 8'),
  ('Room 9'),
  ('Room 10'),
  ('Room 11'),
  ('Room 12'),
  ('Room 13');

INSERT INTO st_ronans_care.ResidentRoom (resID, roomID)
VALUES
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'Test1'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'Room 4')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'Test2'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'Room 2')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'Test3'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'Room 1')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'Test4'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'Room 3')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'Test5'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'Room 10')),
  ((SELECT id FROM st_ronans_care.Resident WHERE surname = 'Test6'), (SELECT id FROM st_ronans_care.Room WHERE roomName = 'Room 13'));
