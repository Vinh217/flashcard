import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController.js';

const router = Router();
const questionController = QuestionController.getInstance();

// Get all questions with filters
router.get('/', questionController.getQuestions.bind(questionController));

// Get question by ID
router.get('/:id', questionController.getQuestionById.bind(questionController));

// Create new question
router.post('/', questionController.createQuestion.bind(questionController));

// Generate question using AI
router.post('/generate', questionController.generateQuestion.bind(questionController));

// Update question
router.put('/:id', questionController.updateQuestion.bind(questionController));

// Delete question
router.delete('/:id', questionController.deleteQuestion.bind(questionController));

// New routes for PART 6 & 7
// Get questions by passage (for PART 6 & 7)
router.get('/passage/:passageId', questionController.getQuestionsByPassage.bind(questionController));

// Get questions by category (for PART 7)
router.get('/category/:category', questionController.getQuestionsByCategory.bind(questionController));

// Get questions by difficulty range
router.get('/difficulty/range', questionController.getQuestionsByDifficultyRange.bind(questionController));

export default router; 