INSERT OR IGNORE INTO teachers (id, name, email, pin) VALUES (1, 'Ustadh Ahmed', 'ustadh@example.com', '1234');

INSERT OR IGNORE INTO students (id, name, title, pin, teacher_id) VALUES (1, 'Ahmad', 'Nazra', '1111', 1);
INSERT OR IGNORE INTO students (id, name, title, pin, teacher_id) VALUES (2, 'Fatima', 'Hifz', '2222', 1);
INSERT OR IGNORE INTO students (id, name, title, pin, teacher_id) VALUES (3, 'Yusuf', 'Tajweed', '3333', 1);
