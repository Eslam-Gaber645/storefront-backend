# API Requirements

## Database schema

### `users` table:-

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(5) NOT NULL DEFAULT 'user',
  username VARCHAR(100) UNIQUE NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  password VARCHAR NOT NULL

  CONSTRAINT check_role CHECK (role in ('admin', 'user'))
);
```

### `products` table:-

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR UNIQUE NOT NULL,
  price REAL NOT NULL
);
```

### `orders` table:-

```sql
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,

  CONSTRAINT check_status CHECK (status in ('active', 'complete'))
);
```

### `users` order_products:-

```sql
CREATE TABLE IF NOT EXISTS order_products (
  id SERIAL PRIMARY KEY,
  quantity SMALLINT NOT NULL DEFAULT 1,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL
);
```

## API Reference

### Users:-

- Signup:-
  - Endpoint: `POST /users/signup`
  - Request body:
    ```json
    {
      "username": "eslamGaber",
      "firstname": "eslam",
      "lastname": "gaber",
      "password": "123456789"
    }
    ```
  - Response:
    - On success:
      - Status code: `201`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "role": "user",
            "username": "eslamGaber",
            "firstname": "eslam",
            "lastname": "gaber"
          }
        }
        ```
    - On fail:
      - Status code: `400` | `409`
- Login:-
  - Endpoint: `POST /users/login`
  - Request body:
    ```json
    {
      "username": "eslamGaber",
      "password": "123456789"
    }
    ```
  - Response:
    - On success:
      - Status code: `200`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "token": "TOKEN HERE"
          }
        }
        ```
    - On fail:
      - Status code: `400` | `401`
- Create user:- `Admin Token required`
  - Endpoint: `POST /users`
  - Request body:
    ```json
    {
      "username": "eslamGaber",
      "firstname": "eslam",
      "lastname": "gaber",
      "role": "admin",
      "password": "123456789"
    }
    ```
  - Response:
    - On success:
      - Status code: `201`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "role": "admin",
            "username": "eslamGaber",
            "firstname": "eslam",
            "lastname": "gaber"
          }
        }
        ```
    - On fail:
      - Status code: `400` | `401` | `403` | `409`
- Delete user:- `Admin Token required`
  - Endpoint: `DELETE /users/:user_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get deleted user`
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "role": "admin",
            "username": "eslamGaber",
            "firstname": "eslam",
            "lastname": "gaber"
          }
        }
        ```
    - On fail:
      - Status code: `401` | `403` | `404`
- Index users:- `Token required`
  - Endpoint: `GET /users`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get users list`
        ```json
        {
          "status": "success",
          "data": [
            {
              "id": 1,
              "role": "admin",
              "username": "eslamGaber",
              "firstname": "eslam",
              "lastname": "gaber"
            }
          ]
        }
        ```
    - On fail:
      - Status code: `401`
- Show single user:- `Token required`
  - Endpoint: `GET /users/:user_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get user`
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "role": "admin",
            "username": "eslamGaber",
            "firstname": "eslam",
            "lastname": "gaber"
          }
        }
        ```
    - On fail:
      - Status code: `401` | `404`

### Products:-

- Create product:- `Admin Token required`
  - Endpoint: `POST /products`
  - Request body:
    ```json
    {
      "product_name": "Product name",
      "price": 5
    }
    ```
  - Response:
    - On success:
      - Status code: `201`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "product_name": "Product name",
            "price": 5
          }
        }
        ```
    - On fail:
      - Status code: `400` | `401` | `403` | `409`
- Delete product:- `Admin Token required`
  - Endpoint: `DELETE /products/:product_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get deleted product`
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "product_name": "Product name",
            "price": 5
          }
        }
        ```
    - On fail:
      - Status code: `401` | `403` | `404`
- Index products:-
  - Endpoint: `GET /products`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get products list`
        ```json
        {
          "status": "success",
          "data": [
            {
              "id": 1,
              "product_name": "Product name",
              "price": 5
            }
          ]
        }
        ```
    - On fail:
      - Status code: N/A
- Show single product:-
  - Endpoint: `GET /products/:product_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get product`
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "product_name": "Product name",
            "price": 5
          }
        }
        ```
    - On fail:
      - Status code: `404`
- Update single product:-
  - Endpoint: `PUT /products/:product_id`
  - Request body:
    ```json
    {
      "product_name": "Updated Product name"
    }
    ```
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get updated product`
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "product_name": "Updated Product name",
            "price": 5
          }
        }
        ```
    - On fail:
      - Status code: `401` | `403` | `404` | `409`

### Orders:-

- Create order:- `Token required`
  - Endpoint: `POST /orders`
  - Request body:
    ```json
    {
      "user_id": 1 //Required admin token.
    }
    ```
  - Response:
    - On success:
      - Status code: `201`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "id": 3,
            "status": "active",
            "user_id": 1
          }
        }
        ```
    - On fail:
      - Status code: `400` | `401` | `409`
- Delete order:- `Admin Token required`
  - Endpoint: `DELETE /orders/:order_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get deleted order`
        ```json
        {
          "status": "success",
          "data": {
            "id": 3,
            "status": "active",
            "user_id": 1
          }
        }
        ```
    - On fail:
      - Status code: `401` | `404`
- Index orders:- `Token required`
  - Endpoint: `GET /orders?status=${status}&user_id=${user_id}`
  - Request params:
    | Parameter | Type | Description | Default |
    | :-------- | :------- | :-------------------------------- | ---- |
    | `status` | `string=("active"\|"complete")` | Target status | "complete"|
    | `user_id` | `integer` | Target user id **Admin token required**| Auth user id |
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get orders list`
        ```json
        {
          "status": "success",
          "data": [
            {
              "id": 3,
              "status": "active",
              "user_id": 1,
              "username": "admin",
              "order_products": [
                {
                  "id": 1, // order_product id
                  "quantity": 2,
                  "product": {
                    "id": 1, // product id
                    "product_name": "product name",
                    "price": 5
                  }
                }
              ]
            }
          ]
        }
        ```
    - On fail:
      - Status code: N/A
- Show single order:- `Token required (Admins can show all exists orders)`
  - Endpoint: `GET /orders/:order_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get order`
        ```json
        {
          "status": "success",
          "data": {
            "id": 3,
            "status": "active",
            "user_id": 1,
            "username": "admin",
            "order_products": [
              {
                "id": 1, // order_product id
                "quantity": 2,
                "product": {
                  "id": 1, // product id
                  "product_name": "product name",
                  "price": 5
                }
              }
            ]
          }
        }
        ```
    - On fail:
      - Status code: `404`
- Show active order:- `Token required`
  - Endpoint: `GET /orders/active?user_id=${user_id}`
  - Request params:
    | Parameter | Type | Description | Default |
    | :-------- | :------- | :-------------------------------- | ---- |
    | `user_id` | `integer` | Target user id **Admin token required**| Auth user id |
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get order`
        ```json
        {
          "status": "success",
          "data": {
            "id": 3,
            "status": "active",
            "user_id": 1,
            "username": "admin",
            "order_products": [
              {
                "id": 1, // order_product id
                "quantity": 2,
                "product": {
                  "id": 1, // product id
                  "product_name": "product name",
                  "price": 5
                }
              }
            ]
          }
        }
        ```
    - On fail:
      - Status code: `404`
- Complete single order:- `Token required`
  - Endpoint: `PUT /orders/:order_id/complete`
  - Response:
    - On success:
      - Status code: `200`
      - Response body: `Get updated order`
        ```json
        {
          "status": "success",
          "data": {
            "id": 3,
            "status": "complete",
            "user_id": 1
          }
        }
        ```
    - On fail:
      - Status code: `401` | `404` | `409`
- Add product to order:- `Token required`
  - Endpoint: `POST /orders/:id/products`
  - Request body:
    ```json
    {
      "product_id": 1,
      "quantity": 2
    }
    ```
  - Response:
    - On success:
      - Status code: `201`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "id": 1, // order product id
            "quantity": 2,
            "product_id": 1,
            "order_id": 3
          }
        }
        ```
    - On fail:
      - Status code: `400` | `401` | `404` | `409`
- Delete product from order:- `Token required`
  - Endpoint: `DELETE /orders/:id/products/:order_product_id`
  - Response:
    - On success:
      - Status code: `200`
      - Response body:
        ```json
        {
          "status": "success",
          "data": {
            "id": 1, // order product id
            "quantity": 2,
            "product_id": 1,
            "order_id": 3
          }
        }
        ```
    - On fail:
      - Status code: `401` | `404`

### Notes

- Admins have a access to any CRUD operation over app.
- Admins only can a create products.
