import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { AppDataSource } from './config/database.js';
import { setupRoomHandlers } from './controllers/roomController.js';
import { setupGameHandlers } from './controllers/gameController.js';
import topicRoutes from './routes/topic.routes.js';
import vocabularyRoutes from './routes/vocabulary.routes.js';
import questionRoutes from './routes/question.routes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/topics', topicRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/questions', questionRoutes);

// Khởi tạo kết nối database
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized');

    // Thiết lập Socket.IO handlers
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      setupRoomHandlers(io, socket);
      setupGameHandlers(io, socket);
    });

    // Khởi động server
    const PORT = process.env.PORT || 3010;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
  }); 