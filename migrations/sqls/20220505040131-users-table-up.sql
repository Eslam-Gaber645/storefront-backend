CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(5) NOT NULL default 'user',
  username VARCHAR(100) unique NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  password VARCHAR NOT NULL

  constraint check_role check (role in ('admin', 'user'))
);