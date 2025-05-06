import { DataSource } from 'typeorm';
import { Room } from '../entities/Room.js';
import { RoomUser } from '../entities/RoomUser.js';
import { User } from '../entities/User.js';
import { Vocabulary } from '../entities/Vocabulary.js';
import { GameQuestion } from '../entities/GameQuestion.js';
import { Topic } from '../entities/Topic.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  logging: false,
  entities: [Room, User, RoomUser, Vocabulary, GameQuestion, Topic],
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