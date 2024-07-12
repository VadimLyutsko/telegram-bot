import { DataSource, EntityManager } from "typeorm";
import { envClientSchema } from "./environment";
import { WorkingTime } from "./WorkingTimeCounterRepository";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export async function createDbConnection(
    options?: PostgresConnectionOptions,
): Promise<EntityManager> {
    const dataSource = new DataSource({
        type: 'postgres',
        host: envClientSchema.DATABASE_HOST,
        port: +envClientSchema.DATABASE_PORT,
        username: envClientSchema.DATABASE_USER,
        password: envClientSchema.DATABASE_PASSWORD,
        database: envClientSchema.DATABASE_NAME,
        logging: false,
        entities: [WorkingTime],
        ...options,
    });

    await dataSource.initialize();

    return dataSource.manager;
}