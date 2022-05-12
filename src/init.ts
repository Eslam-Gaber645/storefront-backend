import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { Client } from 'pg';
import readline from 'readline';
import { DBPool, initEnvVariables } from './configuration';
import { hashingPassword } from './helpers';
import { User, UsersModel } from './models';
initEnvVariables();

function checkInitializedMark(): void {
  if (process.env.APP_INIT) {
    console.info('\x1b[34m\nYour app already initialized.\n Bey👋\n \x1b[0m');
    process.exit(0);
  }
}

function setInitializedMark(): void {
  writeFileSync('.env', readFileSync('.env') + '\nAPP_INIT=true');
}

const rlInterface = readline.createInterface(process.stdin, process.stdout);

type SendQuestion = (question: string, defaultVal?: string) => Promise<string>;

const sendQuestion: SendQuestion = (
  question: string,
  defaultVal?: string
): Promise<string> =>
  new Promise(
    (resolve: (resolve: string | PromiseLike<string>) => void): void =>
      rlInterface.question(question, (answer: string): void =>
        resolve((answer?.trim?.() || defaultVal) as string)
      )
  );

function sayHello(): void {
  console.info(
    "\x1b[34m\nHi👋,\nHere's Eslam Gaber & I'll take you for a quick trip,\nwith a few questions with which the project will be configured safely.\x1b[0m\n\nNOTE:Please make sure u have running postgres server\nbefore we start.\nif no please close this script, run postgres server and start init script again\n\nPress ^C at any time to quit."
  );
}

async function initEnvFile(): Promise<void> {
  console.info(`\x1b[32m\n-Initializing .evn file:-\x1b[0m`);
  const envVars: { [key: string]: string }[] = [
    {
      variable: 'PGUSER',
      description: 'PostgresSql username: (postgres) ',
      defaultVal: 'postgres',
    },
    {
      variable: 'PGPASSWORD',
      description: 'PostgresSql password: (12345678) ',
      defaultVal: '12345678',
    },
    {
      variable: 'PGHOST',
      description: 'PostgresSql host: (localhost) ',
      defaultVal: 'localhost',
    },
    {
      variable: 'PGPORT',
      description: 'PostgresSql port: (5432) ',
      defaultVal: '5432',
    },
    {
      variable: 'PGDATABASE_PROD',
      description: 'PostgresSql production database name: (storefront) ',
      defaultVal: 'storefront',
    },
    {
      variable: 'PGDATABASE_DEV',
      description: 'PostgresSql development database name: (storefront_dev) ',
      defaultVal: 'storefront_dev',
    },
    {
      variable: 'PGDATABASE_TEST',
      description: 'PostgresSql test database name: (storefront_test) ',
      defaultVal: 'storefront_test',
    },
    {
      variable: 'APP_PORT',
      description: 'API Server port: (3000) ',
      defaultVal: '3000',
    },
    {
      variable: 'PWH_SALT',
      description: 'Password hashing salt: (8e93dfb296851b117) ',
      defaultVal: '8e93dfb296851b117',
    },
    {
      variable: 'PWH_ITERATIONS',
      description: 'Password hashing rounds: (50000) ',
      defaultVal: '50000',
    },
    {
      variable: 'PWH_ALGORITHM',
      description: 'Password hashing algorithm type: (sha512) ',
      defaultVal: 'sha512',
    },
    {
      variable: 'JWT_KEY',
      description: 'JWT secret key: (95b2b9b24e6c3a4f) ',
      defaultVal: '95b2b9b24e6c3a4f',
    },
  ];

  let envContent = 'NODE_ENV="development"\n';

  for (const { variable, description, defaultVal } of envVars) {
    const varValue = await sendQuestion(description, defaultVal);

    envContent += `${variable}="${varValue}"\n`;

    process.env[variable] = varValue;
  }

  writeFileSync('.env', envContent);
  console.info(`\x1b[32m-.env file has been created!\x1b[0m`);
}

async function initAdminAccount(): Promise<void> {
  console.info(`\x1b[32m\n-Initializing admin account:-\x1b[0m`);
  const init_admin: User = {
      username: await sendQuestion(
        'Username for admin account: (admin) ',
        'admin'
      ),
      firstname: await sendQuestion(
        'First name for admin account: (first) ',
        'first'
      ),
      lastname: await sendQuestion(
        'Last name for admin account: (last) ',
        'last'
      ),
      password: await sendQuestion(
        'Password for admin account: (12345678) ',
        '12345678'
      ),
      role: 'admin',
    },
    passwordHash: string = await hashingPassword(init_admin.password);

  init_admin.password = passwordHash;

  const dbsNames = [process.env.PGDATABASE_PROD, process.env.PGDATABASE_DEV];

  for (const database of dbsNames) {
    DBPool.renew({ database });

    try {
      await new UsersModel().create(init_admin);
    } catch (e) {
      console.error(
        "\x1b[31m\nCan't create admin account,\n please make sure you are typed correct postgresSQL access info.\x1b[0m"
      );
      process.exit(1);
    }
  }
  console.info(
    `\x1b[32m-Admin account has been created in development and production databases!.\x1b[0m`
  );
}

async function createDatabases(): Promise<void> {
  console.info(`\x1b[32m\n-Create app databases:-\x1b[0m`);

  const { PGDATABASE_PROD, PGDATABASE_DEV, PGDATABASE_TEST } = process.env;

  try {
    await createDatabase_helper(PGDATABASE_PROD as string);
    console.info(`--${PGDATABASE_PROD} created successfully.`);
    await createDatabase_helper(PGDATABASE_DEV as string);
    console.info(`--${PGDATABASE_DEV} created successfully.`);
    await createDatabase_helper(PGDATABASE_TEST as string);
    console.info(`--${PGDATABASE_TEST} created successfully.`);
  } catch (e) {
    console.error(
      "\x1b[31m\nCan't create app databases,\n please make sure you are typed correct postgresSQL access info.\x1b[0m"
    );
    process.exit(1);
  }

  console.info(`\x1b[32m-App databases has been created!.\x1b[0m`);
}

function startDBMigrations(): void {
  console.info(`\x1b[32m\n-Start databases migrations:-\x1b[0m`);

  const { PGDATABASE_PROD, PGDATABASE_DEV } = process.env;

  try {
    execSync('npm run db up');
    console.info(`--${PGDATABASE_PROD} migration has been completed.`);
    execSync('npm run db:dev up');
    console.info(`--${PGDATABASE_DEV} migration has been completed.`);
  } catch (e) {
    console.error("\x1b[31m\nCan't migrate app databases.\x1b[0m");
    process.exit(1);
  }

  console.info(`\x1b[32m-Databases migrations has been completed!.\x1b[0m`);
}

function sayBye(): void {
  console.info(
    '\x1b[34m\nThe project has been successfully prepared,\nthank you and enjoy your time👋\x1b[0m'
  );
}

async function createDatabase_helper(dbName: string): Promise<void> {
  const client = new Client({
    database: 'postgres',
  });

  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS ${dbName};`);
  await client.query(`CREATE DATABASE ${dbName};`);
  await client.end();
}

(async (): Promise<void> => {
  checkInitializedMark();
  sayHello();
  await initEnvFile();
  await createDatabases();
  startDBMigrations();
  await initAdminAccount();
  rlInterface.close();
  setInitializedMark();
  sayBye();
})().catch(e => {
  throw e;
});
