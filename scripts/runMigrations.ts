import { createDbConnection } from '../src/createDbConnection';

console.log('STARTING MIGRATIONS');

(async () => {
   const dbConnection = await createDbConnection({
    migrations: [`${__dirname}/migrations/*.ts`],
    type: 'postgres',
   });

  await dbConnection.connection.runMigrations();
})()
  .then(() => {
    console.log('MIGRATIONS COMPLETE');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
