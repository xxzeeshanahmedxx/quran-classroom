CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  pin TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nazra' CHECK (title IN ('Nazra', 'Hifz', 'Tajweed')),
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  pin TEXT NOT NULL UNIQUE,
  teacher_id INTEGER NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  student_ids TEXT NOT NULL DEFAULT '[]',
  room_name TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
