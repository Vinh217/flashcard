import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1746642414491 implements MigrationInterface {
    name = 'Migrations1746642414491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`passage\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`text_with_blanks\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`blank_positions\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`paragraph_number\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`question_category\` enum ('main_idea', 'detail', 'inference', 'purpose', 'reference') NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` CHANGE \`type\` \`type\` enum ('grammar', 'vocabulary', 'preposition', 'conjunction', 'main_idea', 'detail', 'inference', 'purpose', 'reference') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions\` CHANGE \`type\` \`type\` enum ('grammar', 'vocabulary', 'preposition', 'conjunction') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`question_category\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`paragraph_number\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`blank_positions\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`text_with_blanks\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`passage\``);
    }

}
