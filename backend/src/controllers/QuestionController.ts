import { Request, Response } from 'express';
import { QuestionService } from '../services/QuestionService.js';
import { QuestionPart, QuestionType, QuestionCategory } from '../types/question.js';

export class QuestionController {
    private static instance: QuestionController;
    private readonly questionService: QuestionService;

    private constructor() {
        this.questionService = QuestionService.getInstance();
    }

    public static getInstance(): QuestionController {
        if (!QuestionController.instance) {
            QuestionController.instance = new QuestionController();
        }
        return QuestionController.instance;
    }

    public async getQuestions(req: Request, res: Response): Promise<void> {
        try {
            const { part, type, difficulty, question_category } = req.query;
            const questions = await this.questionService.getQuestions({
                part: part as QuestionPart,
                type: type as QuestionType,
                difficulty: difficulty ? Number(difficulty) : undefined,
                question_category: question_category as QuestionCategory
            });
            res.json(questions);
        } catch (error) {
            console.error('Error getting questions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getQuestionById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const question = await this.questionService.getQuestionById(id);
            if (!question) {
                res.status(404).json({ error: 'Question not found' });
                return;
            }
            res.json(question);
        } catch (error) {
            console.error('Error getting question:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async createQuestion(req: Request, res: Response): Promise<void> {
        try {
            const questionData = req.body;
            const question = await this.questionService.createQuestion(questionData);
            res.status(201).json(question);
        } catch (error) {
            console.error('Error creating question:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async generateQuestion(req: Request, res: Response): Promise<void> {
        try {
            const { part, type } = req.body;
            const question = await this.questionService.generateQuestion(part as QuestionPart, type as QuestionType);
            res.status(201).json(question);
        } catch (error) {
            console.error('Error generating question:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async updateQuestion(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const questionData = req.body;
            const question = await this.questionService.updateQuestion(id, questionData);
            if (!question) {
                res.status(404).json({ error: 'Question not found' });
                return;
            }
            res.json(question);
        } catch (error) {
            console.error('Error updating question:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async deleteQuestion(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.questionService.deleteQuestion(id);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting question:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // New endpoints for PART 6 & 7
    public async getQuestionsByPassage(req: Request, res: Response): Promise<void> {
        try {
            const { passageId } = req.params;
            const questions = await this.questionService.getQuestionsByPassage(passageId);
            res.json(questions);
        } catch (error) {
            console.error('Error getting questions by passage:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getQuestionsByCategory(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.params;
            const questions = await this.questionService.getQuestionsByCategory(
                category as QuestionCategory
            );
            res.json(questions);
        } catch (error) {
            console.error('Error getting questions by category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getQuestionsByDifficultyRange(req: Request, res: Response): Promise<void> {
        try {
            const { min, max } = req.query;
            const questions = await this.questionService.getQuestionsByDifficultyRange(
                Number(min),
                Number(max)
            );
            res.json(questions);
        } catch (error) {
            console.error('Error getting questions by difficulty range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 