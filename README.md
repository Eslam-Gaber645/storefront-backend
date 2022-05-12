# (Udacity) backend store

This project is for the Advanced Full-Stack Web Development Path provided by udacity.

It's online storefront to showcase great product ideas.\
Admins able to create products and has full permissions to CRUD operations over app.\
Users able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page.

## Tech Stack

- Server
  - Node
  - Express
  - PostgresSQL
- Development
  - Typescript
  - Eslint
  - Prettier
  - Jasmine
  - Supertest

## Installation

Clone the app

```bash
  git clone https://github.com/Eslam-Gaber645/storefront-backend.git
```

Go to the app directory

```bash
  cd ./storefront-backend
```

Install dependencies

```bash
  npm i
```

Build app

```bash
  npm run build
```

Initialize app

```bash
  npm run init
```

**\*Important\*** \
 Please make sure you entered the correct information in Initialize step.

## Running Server

To run server in production env.

```bash
  npm run start
```

To run server in development env.

```bash
  npm run start:dev
```

_server is running now on the specified port that you configured in the initialize step!_

## Running Tests

To start tests in watch mode

```bash
  npm run start:test
```

To run tests after the app was built

```bash
  npm run test
```

## All NPM Tasks

| Task         | Action                                     | Note                                        |
| :----------- | :----------------------------------------- | :------------------------------------------ |
| `clean`      | Remove build directory                     | .                                           |
| `build`      | Build the app                              | Uses the `clean` task.                      |
| `init`       | Initialize app after build it.             | You have to `build` the app first.          |
| `test`       | Run app tests                              | You have to `build` & `init` the app first. |
| `start`      | Start the server in production env.        | You have to `build` & `init` the app first. |
| `start:dev`  | Start the dev server                       | Uses the `clean` task.                      |
| `start:test` | Start watching, To build app and run tests | Uses the `clean` task.                      |
| `prettier`   | Prettify source code                       | .                                           |
| `lint`       | Linting source code                        | .                                           |
| `lint:fix`   | Linting and fix source code                | .                                           |
| `db`         | To run production db-migrate commands      | Used by `init` task.                        |
| `db:dev`     | To run development db-migrate commands     | Used by `init` task.                        |
| `db:test`    | To run test db-migrate commands            | Used by `test`&`start:test` tasks.          |

_Please note: You will not need to run `db:_` tasks because they are run automatically\*

## Environment Variables

- `PGUSER` : Postgres username.
- `PGPASSWORD` : Postgres password.
- `PGHOST` : Postgres host.
- `PGPORT` : Postgres port.
- `PGDATABASE_PROD` : Postgres production database name.
- `PGDATABASE_DEV` : Postgres development database name.
- `PGDATABASE_TEST` : Postgres test database name.
- `APP_PORT` : API Server port.
- `PWH_SALT` : Password hashing salt.
- `PWH_ITERATIONS` : Password hashing rounds.
- `PWH_ALGORITHM` : Password hashing algorithm type.
- `JWT_KEY` : JWT secret key.
- `PORT` : The server port.

## API Requirements

[**Database schema**](https://github.com/Eslam-Gaber645/storefront-backend/blob/master/REQUIREMENTS.md#Database+schema)\
[**API Reference**](https://github.com/Eslam-Gaber645/storefront-backend/blob/master/REQUIREMENTS.md#API+Reference)
