import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../config/database.js';
import { RoomUser } from '../entities/RoomUser.js';
import { Room } from '../entities/Room.js';
import { User } from '../entities/User.js';
import { Vocabulary } from '../entities/Vocabulary.js';
import { GameQuestion } from '../entities/GameQuestion.js';
import { IGameResult, IQuestionOption, IQuizQuestion } from '../types/entities.js';

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
  isShowingResults: boolean;
  resultsTimer: NodeJS.Timeout | null;
  allAnswered: boolean;
  questionStartTime?: number;
}

const gameStates = new Map<string, GameState>();

// Thời gian cho mỗi câu hỏi (giây)
const QUESTION_TIME = 15;
// Thời gian hiển thị kết quả (giây)
const RESULT_DISPLAY_TIME = 2;
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
      timeLeft: QUESTION_TIME,
      isShowingResults: false,
      resultsTimer: null,
      allAnswered: false
    });
    
    // Gửi câu hỏi đầu tiên
    io.to(room.id).emit('question', { 
      questions,
      timeLeft: QUESTION_TIME,
      maxScore: 100
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

  // Dừng timer cũ nếu có
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
  
  // Đặt lại thời gian
  gameState.timeLeft = QUESTION_TIME;
  gameState.questionStartTime = Date.now(); // Lưu thời gian bắt đầu thực sự
  
  // Tạo bộ đếm mới
  const timer = setInterval(() => {
    const gameState = gameStates.get(roomId);
    if (!gameState) {
      clearInterval(timer);
      return;
    }
    
    // Tính thời gian thực tế đã trôi qua
    const elapsedTime = Math.floor((Date.now() - (gameState.questionStartTime || Date.now())) / 1000);
    const newTimeLeft = Math.max(0, QUESTION_TIME - elapsedTime);
    
    // Chỉ cập nhật nếu thời gian thực sự thay đổi
    if (newTimeLeft !== gameState.timeLeft) {
      gameState.timeLeft = newTimeLeft;
      
      // Gửi cập nhật thời gian
      io.to(roomId).emit('time_update', { 
        timeLeft: gameState.timeLeft,
        currentMaxScore: Math.round(100 * (1 - (QUESTION_TIME - gameState.timeLeft) / QUESTION_TIME * 0.5))
      });
      
      // Kiểm tra nếu hết thời gian
      if (gameState.timeLeft <= 0) {
        clearInterval(timer);
        gameState.timer = null;
        
        // Chuyển sang câu hỏi tiếp theo
        moveToNextQuestion(io, roomId);
      }
    }
  }, 100); // Cập nhật mỗi 100ms để có độ chính xác cao hơn
  
  // Lưu bộ đếm
  gameState.timer = timer;
};

// Chuyển sang câu hỏi tiếp theo
const moveToNextQuestion = async (io: Server, roomId: string): Promise<void> => {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;
  
  // Reset trạng thái
  gameState.isShowingResults = false;
  gameState.allAnswered = false;
  if (gameState.resultsTimer) {
    clearTimeout(gameState.resultsTimer);
    gameState.resultsTimer = null;
  }
  
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
    timeLeft: QUESTION_TIME,
    maxScore: 100
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

      // Nếu đang trong giai đoạn hiển thị kết quả, không cho phép trả lời
      if (gameState.isShowingResults) {
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
      
      // Nếu tất cả người chơi đã trả lời và chưa đánh dấu là đã trả lời hết
      if (currentQuestionAnswers.length >= roomUsers.length && !gameState.allAnswered) {
        // Đánh dấu là tất cả đã trả lời
        gameState.allAnswered = true;
        
        // Dừng timer câu hỏi
        if (gameState.timer) {
          clearInterval(gameState.timer);
          gameState.timer = null;
        }
        
        // Đánh dấu đang trong giai đoạn hiển thị kết quả
        gameState.isShowingResults = true;
        
        // Gửi thông báo hiển thị kết quả
        io.to(room.id).emit('show_results', {
          questionId,
          timeLeft: RESULT_DISPLAY_TIME
        });
        
        // Đặt timer cho việc hiển thị kết quả
        gameState.resultsTimer = setTimeout(() => {
          moveToNextQuestion(io, room.id);
        }, RESULT_DISPLAY_TIME * 1000);
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
