CREATE TABLE IF NOT EXISTS order_products (
  id SERIAL PRIMARY KEY,
  quantity smallint NOT NULL DEFAULT 1,
  product_id integer REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  order_id integer REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL
);