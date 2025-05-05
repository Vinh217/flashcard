import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../config/database.ts';
import { Room } from '../entities/Room.ts';
import { User } from '../entities/User.ts';
import { RoomUser } from '../entities/RoomUser.ts';
import { Vocabulary } from '../entities/Vocabulary.ts';
import { GameQuestion } from '../entities/GameQuestion.ts';
import { IQuizQuestion, IQuestionOption, IGameResult } from '../types/entities.ts';

const roomRepository = AppDataSource.getRepository(Room);
const userRepository = AppDataSource.getRepository(User);
const roomUserRepository = AppDataSource.getRepository(RoomUser);
const vocabularyRepository = AppDataSource.getRepository(Vocabulary);
const gameQuestionRepository = AppDataSource.getRepository(GameQuestion);

// Lưu trữ trạng thái game cho từng phòng
interface GameState {
  questions: IQuizQuestion[];
  currentQuestionIndex: number;
  playerAnswers: Map<string, { 
    playerId: string; 
    questionId: string; 
    optionId: string; 
    isCorrect: boolean;
    answerTime: number;
  }>;
  timer: NodeJS.Timeout | null;
  timeLeft: number;
}

const gameStates = new Map<string, GameState>();

// Thời gian cho mỗi câu hỏi (giây)
const QUESTION_TIME = 10;
// Số lượng câu hỏi trong mỗi game
const QUESTIONS_PER_GAME = 20;

// Helper để tính điểm dựa trên thời gian trả lời
const calculateScore = (isCorrect: boolean, answerTime: number): number => {
  if (!isCorrect) return 0;
  // Trả lời càng nhanh, điểm càng cao (tối đa 100 điểm cho mỗi câu trả lời đúng)
  return Math.round(100 * (1 - (answerTime / QUESTION_TIME) * 0.5));
};

// Lấy từ vựng ngẫu nhiên từ DB
const getRandomVocabulary = async (limit: number): Promise<Vocabulary[]> => {
  // Lấy tổng số từ vựng
  const count = await vocabularyRepository.count();
  
  // Lấy ngẫu nhiên các từ
  return vocabularyRepository
    .createQueryBuilder('vocabulary')
    .orderBy('RAND()')
    .take(limit)
    .getMany();
};

// Tạo câu hỏi quiz với 4 lựa chọn (1 đúng, 3 sai)
const createQuizQuestion = async (correctVocab: Vocabulary, allVocab: Vocabulary[]): Promise<IQuizQuestion> => {
  // Lấy 3 từ vựng khác làm đáp án sai
  const incorrectOptions = allVocab
    .filter(v => v.id !== correctVocab.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  
  // Tạo các lựa chọn
  const options: IQuestionOption[] = [
    {
      id: `${correctVocab.id}_correct`,
      text: correctVocab.meaning,
      isCorrect: true
    },
    ...incorrectOptions.map(v => ({
      id: `${v.id}_incorrect`,
      text: v.meaning,
      isCorrect: false
    }))
  ];
  
  // Trộn các lựa chọn
  const shuffledOptions = options.sort(() => 0.5 - Math.random());
  
  return {
    id: correctVocab.id,
    word: correctVocab.word,
    options: shuffledOptions
  };
};

// Tạo bộ câu hỏi quiz cho game
const generateQuizQuestions = async (roomId: string): Promise<IQuizQuestion[]> => {
  try {
    // Lấy nhiều hơn số lượng cần để có đủ lựa chọn cho đáp án sai
    const wordCount = QUESTIONS_PER_GAME * 4; 
    const vocabularies = await getRandomVocabulary(wordCount);
    
    if (vocabularies.length < QUESTIONS_PER_GAME) {
      throw new Error('Không đủ từ vựng để tạo trò chơi');
    }
    
    // Chọn từ vựng cho các câu hỏi
    const gameVocabularies = vocabularies.slice(0, QUESTIONS_PER_GAME);
    
    // Tạo câu hỏi quiz cho mỗi từ vựng
    const questions: IQuizQuestion[] = [];
    for (const vocab of gameVocabularies) {
      const question = await createQuizQuestion(vocab, vocabularies);
      questions.push(question);
      
      // Lưu câu hỏi vào database
      const gameQuestion = gameQuestionRepository.create({
        room_id: roomId,
        vocabulary_id: vocab.id
      });
      await gameQuestionRepository.save(gameQuestion);
    }
    
    return questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
};

// Khởi động game mới
const startNewGame = async (io: Server, roomCode: string): Promise<void> => {
  try {
    // Tìm phòng theo mã
    const room = await roomRepository.findOne({
      where: { code: roomCode }
    });
    
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }
    
    // Cập nhật trạng thái phòng
    room.status = 'playing';
    await roomRepository.save(room);
    
    // Tạo câu hỏi quiz
    const questions = await generateQuizQuestions(room.id);
    
    // Khởi tạo trạng thái game
    gameStates.set(room.id, {
      questions,
      currentQuestionIndex: 0,
      playerAnswers: new Map(),
      timer: null,
      timeLeft: QUESTION_TIME
    });
    
    // Gửi câu hỏi đầu tiên
    io.to(room.id).emit('question', { 
      questions,
      timeLeft: QUESTION_TIME
    });
    
    // Bắt đầu bộ đếm thời gian
    startQuestionTimer(io, room.id);
  } catch (error) {
    console.error('Error starting new game:', error);
    throw error;
  }
};

// Xử lý bộ đếm thời gian cho câu hỏi
const startQuestionTimer = (io: Server, roomId: string): void => {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;
  
  // Đặt lại thời gian
  gameState.timeLeft = QUESTION_TIME;
  
  // Tạo bộ đếm mới
  const timer = setInterval(() => {
    const gameState = gameStates.get(roomId);
    if (!gameState) {
      clearInterval(timer);
      return;
    }
    
    // Giảm thời gian
    gameState.timeLeft--;
    
    // Gửi cập nhật thời gian
    io.to(roomId).emit('time_update', { timeLeft: gameState.timeLeft });
    
    // Kiểm tra nếu hết thời gian
    if (gameState.timeLeft <= 0) {
      clearInterval(timer);
      gameState.timer = null;
      
      // Chuyển sang câu hỏi tiếp theo
      moveToNextQuestion(io, roomId);
    }
  }, 1000);
  
  // Lưu bộ đếm
  gameState.timer = timer;
};

// Chuyển sang câu hỏi tiếp theo
const moveToNextQuestion = async (io: Server, roomId: string): Promise<void> => {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;
  
  // Tăng index câu hỏi
  gameState.currentQuestionIndex++;
  
  // Kiểm tra nếu đã hết câu hỏi
  if (gameState.currentQuestionIndex >= gameState.questions.length) {
    // Kết thúc game
    await endGame(io, roomId);
    return;
  }
  
  // Gửi câu hỏi tiếp theo
  io.to(roomId).emit('next_question', { 
    questionIndex: gameState.currentQuestionIndex,
    timeLeft: QUESTION_TIME
  });
  
  // Bắt đầu bộ đếm thời gian mới
  startQuestionTimer(io, roomId);
};

// Kết thúc game và gửi kết quả
const endGame = async (io: Server, roomId: string): Promise<void> => {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;
  
  try {
    // Tìm phòng
    const room = await roomRepository.findOne({
      where: { id: roomId }
    });
    
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }
    
    // Xóa bộ đếm thời gian
    if (gameState.timer) {
      clearInterval(gameState.timer);
      gameState.timer = null;
    }
    
    // Tính điểm cho mỗi người chơi
    const playerScores = new Map<string, { playerId: string, score: number }>();
    
    // Duyệt qua tất cả câu trả lời
    for (const answer of gameState.playerAnswers.values()) {
      const { playerId, isCorrect, answerTime } = answer;
      
      // Tính điểm
      const score = calculateScore(isCorrect, answerTime);
      
      // Cập nhật tổng điểm
      const playerScore = playerScores.get(playerId) || { playerId, score: 0 };
      playerScore.score += score;
      playerScores.set(playerId, playerScore);
    }
    
    // Lấy thông tin người chơi trong phòng
    const roomUsers = await roomUserRepository.find({
      where: { room_id: roomId },
      relations: ['user']
    });
    
    // Cập nhật điểm cho người chơi trong db
    for (const ru of roomUsers) {
      const playerScore = playerScores.get(ru.user_id);
      if (playerScore) {
        ru.score = playerScore.score;
        await roomUserRepository.save(ru);
      }
    }
    
    // Cập nhật trạng thái phòng
    room.status = 'finished';
    await roomRepository.save(room);
    
    // Tạo kết quả game để gửi về client
    const results: IGameResult[] = roomUsers.map(ru => ({
      playerId: ru.user_id,
      username: ru.user.username,
      score: ru.score
    }));
    
    // Gửi kết quả về client
    io.to(roomId).emit('game_results', { results });
    
    // Xóa trạng thái game
    gameStates.delete(roomId);
  } catch (error) {
    console.error('Error ending game:', error);
  }
};

// Thiết lập các event handler
export const setupGameHandlers = (io: Server, socket: Socket) => {
  // Người chơi gửi câu trả lời
  socket.on('submit_answer', async (data: {
    roomCode: string;
    questionId: string;
    optionId: string;
  }) => {
    try {
      const { roomCode, questionId, optionId } = data;
      
      // Tìm phòng theo mã
      const room = await roomRepository.findOne({
        where: { code: roomCode }
      });
      
      if (!room || room.status !== 'playing') {
        return;
      }
      
      // Tìm người dùng theo socket id
      const user = await userRepository.findOne({
        where: { socket_id: socket.id }
      });
      
      if (!user) {
        return;
      }
      
      const gameState = gameStates.get(room.id);
      if (!gameState) {
        return;
      }
      
      // Lấy câu hỏi hiện tại
      const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
      if (!currentQuestion || currentQuestion.id !== questionId) {
        return;
      }
      
      // Tìm lựa chọn đã chọn
      const selectedOption = currentQuestion.options.find(o => o.id === optionId);
      if (!selectedOption) {
        return;
      }
      
      // Tạo key duy nhất cho câu trả lời (người chơi + câu hỏi)
      const answerKey = `${user.id}_${questionId}`;
      
      // Kiểm tra nếu người chơi đã trả lời
      if (gameState.playerAnswers.has(answerKey)) {
        return;
      }
      
      // Lưu câu trả lời
      gameState.playerAnswers.set(answerKey, {
        playerId: user.id,
        questionId,
        optionId,
        isCorrect: selectedOption.isCorrect,
        answerTime: QUESTION_TIME - gameState.timeLeft
      });
      
      // Thông báo kết quả riêng cho người chơi đã trả lời
      socket.emit('answer_result', { 
        questionId,
        isCorrect: selectedOption.isCorrect
      });
      
      // Kiểm tra nếu tất cả người chơi đã trả lời
      const roomUsers = await roomUserRepository.find({
        where: { room_id: room.id }
      });
      
      const currentQuestionAnswers = Array.from(gameState.playerAnswers.values())
        .filter(a => a.questionId === questionId);
      
      // Nếu tất cả người chơi đã trả lời, chuyển sang câu hỏi tiếp theo
      if (currentQuestionAnswers.length >= roomUsers.length) {
        if (gameState.timer) {
          clearInterval(gameState.timer);
          gameState.timer = null;
        }
        
        // Chờ một chút để người chơi xem kết quả
        setTimeout(() => {
          moveToNextQuestion(io, room.id);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  });
  
  // Khởi động game mới
  socket.on('start_game', async (data: { roomCode: string }) => {
    try {
      await startNewGame(io, data.roomCode);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });
};
