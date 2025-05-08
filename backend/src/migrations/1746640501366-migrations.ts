import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1746640501366 implements MigrationInterface {
    name = 'Migrations1746640501366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rooms\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'waiting', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`started_at\` datetime NULL, \`ended_at\` datetime NULL, UNIQUE INDEX \`IDX_368d83b661b9670e7be1bbb9cd\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_users\` (\`room_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`score\` int NOT NULL DEFAULT '0', \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`room_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_progress\` (\`id\` varchar(36) NOT NULL, \`part\` enum ('PART5', 'PART6', 'PART7') NOT NULL, \`type\` enum ('grammar', 'vocabulary', 'preposition', 'conjunction') NOT NULL, \`total_questions\` int NOT NULL, \`correct_answers\` int NOT NULL, \`average_time\` float NOT NULL, \`weak_points\` text NULL, \`user_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_answers\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`question_id\` varchar(255) NOT NULL, \`user_answer\` varchar(255) NOT NULL, \`is_correct\` tinyint NOT NULL, \`time_taken\` float NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`questionId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`username\` varchar(255) NOT NULL, \`is_host\` tinyint NOT NULL DEFAULT 0, \`socket_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`topics\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1304b1c61016e63f60cd147ce6\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vocabulary\` (\`id\` varchar(36) NOT NULL, \`word\` varchar(255) NOT NULL, \`pronunciation\` varchar(255) NULL, \`meaning\` text NOT NULL, \`topic_id\` varchar(255) NOT NULL, \`synonym\` varchar(255) NULL, \`word_family\` varchar(255) NULL, \`example\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game_questions\` (\`id\` varchar(36) NOT NULL, \`room_id\` varchar(255) NOT NULL, \`vocabulary_id\` varchar(255) NOT NULL, \`asked_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` varchar(36) NOT NULL, \`part\` enum ('PART5', 'PART6', 'PART7') NOT NULL, \`type\` enum ('grammar', 'vocabulary', 'preposition', 'conjunction') NOT NULL, \`content\` text NOT NULL, \`options\` text NOT NULL, \`correct_answer\` varchar(255) NOT NULL, \`explanation\` text NOT NULL, \`difficulty\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ai_generated_content\` (\`id\` varchar(36) NOT NULL, \`type\` enum ('question', 'explanation', 'suggestion') NOT NULL, \`content\` text NOT NULL, \`metadata\` text NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`room_users\` ADD CONSTRAINT \`FK_443c187b06edbc18738b24aac34\` FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_users\` ADD CONSTRAINT \`FK_5421c55fb0212b9ff62fe9d3c89\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD CONSTRAINT \`FK_b5d0e1b57bc6c761fb49e79bf89\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_23984f136e23ff9a75e7c9c3c27\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_47a3ffddaba37b9707f93e4b140\` FOREIGN KEY (\`questionId\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` ADD CONSTRAINT \`FK_aef96ca5f37fce2b8693eccf24a\` FOREIGN KEY (\`topic_id\`) REFERENCES \`topics\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_questions\` ADD CONSTRAINT \`FK_ef1d18f462b308a541bf615759d\` FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_questions\` ADD CONSTRAINT \`FK_0aadbd6e8ac548673dbf556ebf7\` FOREIGN KEY (\`vocabulary_id\`) REFERENCES \`vocabulary\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Insert initial topics
        await queryRunner.query(`INSERT INTO topics (id, name) VALUES
            (UUID(), 'Job'),
            (UUID(), 'Advertising Marketing Promotion'),
            (UUID(), 'Manufacturing'),
            (UUID(), 'Shipping'),
            (UUID(), 'Technology Internet'),
            (UUID(), 'Contract Law'),
            (UUID(), 'Shopping'),
            (UUID(), 'Travel And Tourism'),
            (UUID(), 'Real Estate Banking'),
            (UUID(), 'Cuisine Leisure')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`game_questions\` DROP FOREIGN KEY \`FK_0aadbd6e8ac548673dbf556ebf7\``);
        await queryRunner.query(`ALTER TABLE \`game_questions\` DROP FOREIGN KEY \`FK_ef1d18f462b308a541bf615759d\``);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` DROP FOREIGN KEY \`FK_aef96ca5f37fce2b8693eccf24a\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_47a3ffddaba37b9707f93e4b140\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_23984f136e23ff9a75e7c9c3c27\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP FOREIGN KEY \`FK_b5d0e1b57bc6c761fb49e79bf89\``);
        await queryRunner.query(`ALTER TABLE \`room_users\` DROP FOREIGN KEY \`FK_5421c55fb0212b9ff62fe9d3c89\``);
        await queryRunner.query(`ALTER TABLE \`room_users\` DROP FOREIGN KEY \`FK_443c187b06edbc18738b24aac34\``);
        await queryRunner.query(`DROP TABLE \`ai_generated_content\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP TABLE \`game_questions\``);
        await queryRunner.query(`DROP TABLE \`vocabulary\``);
        await queryRunner.query(`DROP INDEX \`IDX_1304b1c61016e63f60cd147ce6\` ON \`topics\``);
        await queryRunner.query(`DROP TABLE \`topics\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`user_answers\``);
        await queryRunner.query(`DROP TABLE \`user_progress\``);
        await queryRunner.query(`DROP TABLE \`room_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_368d83b661b9670e7be1bbb9cd\` ON \`rooms\``);
        await queryRunner.query(`DROP TABLE \`rooms\``);
    }

}
