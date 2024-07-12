import { MigrationInterface, QueryRunner } from 'typeorm';
import { SqlReader } from 'node-sql-reader';

console.log('InitDb11720721870000');


export class InitDb11720721870000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> { 
    const queries = SqlReader.readSqlFile('./schema.sql');
    console.log('queries:', queries);
    
    for (let query of queries) {
      console.log('query:', query);
      
      await queryRunner.query(query);
    }
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    console.log('not implemented');
  }
}
