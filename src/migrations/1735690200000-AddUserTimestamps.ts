import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserTimestamps1735690200000 implements MigrationInterface {
  name = 'AddUserTimestamps1735690200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // A tabela pode ser 'user' ou 'users' dependendo da migration inicial
    let tableName = 'user';
    try {
      const usersTable = await queryRunner.getTable('users');
      if (usersTable) {
        tableName = 'users';
      }
    } catch {
      tableName = 'user';
    }

    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    let tableName = 'user';
    try {
      const usersTable = await queryRunner.getTable('users');
      if (usersTable) {
        tableName = 'users';
      }
    } catch {
      tableName = 'user';
    }

    await queryRunner.dropColumn(tableName, 'updated_at');
    await queryRunner.dropColumn(tableName, 'created_at');
  }
}


