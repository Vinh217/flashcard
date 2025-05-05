import { DataSource } from 'typeorm';
import { Room } from '../entities/Room.ts';
import { User } from '../entities/User.ts';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  logging: false,
  entities: [Room, User],
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