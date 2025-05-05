import { DataSource } from 'typeorm';
import { Room } from '../entities/Room.ts';
import { User } from '../entities/User.ts';
import { RoomUser } from '../entities/RoomUser.ts';
import { Vocabulary } from '../entities/Vocabulary.ts';
import { GameQuestion } from '../entities/GameQuestion.ts';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  logging: false,
  entities: [Room, User, RoomUser, Vocabulary, GameQuestion],
  subscribers: [],
  migrations: [],
});

// Khởi tạo kết nối
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  }); 