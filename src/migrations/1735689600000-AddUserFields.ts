import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserFields1735689600000 implements MigrationInterface {
  name = 'AddUserFields1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // A tabela pode ser 'user' ou 'users' dependendo da migration anterior
    // Verifica qual existe
    let tableName = 'user';
    try {
      const usersTable = await queryRunner.getTable('users');
      if (usersTable) {
        tableName = 'users';
      }
    } catch {
      // Se não encontrar, usa 'user'
      tableName = 'user';
    }
    
    // Adiciona coluna discord_id
    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'discord_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Adiciona coluna discord_username
    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'discord_username',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Adiciona coluna last_login_ip
    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'last_login_ip',
        type: 'varchar',
        length: '45', // IPv6 pode ter até 45 caracteres
        isNullable: true,
      }),
    );

    // Adiciona coluna role com enum
    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'role',
        type: 'enum',
        enum: ['user', 'admin'],
        default: "'user'",
      }),
    );

    // Adiciona coluna status com enum
    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'banned'],
        default: "'active'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // A tabela pode ser 'user' ou 'users' dependendo da migration anterior
    let tableName = 'user';
    try {
      const usersTable = await queryRunner.getTable('users');
      if (usersTable) {
        tableName = 'users';
      }
    } catch {
      tableName = 'user';
    }
    
    // Remove as colunas na ordem inversa
    await queryRunner.dropColumn(tableName, 'status');
    await queryRunner.dropColumn(tableName, 'role');
    await queryRunner.dropColumn(tableName, 'last_login_ip');
    await queryRunner.dropColumn(tableName, 'discord_username');
    await queryRunner.dropColumn(tableName, 'discord_id');
  }
}

