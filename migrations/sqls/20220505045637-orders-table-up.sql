CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  user_id integer REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,

  constraint check_status check (status in ('active', 'complete'))
);