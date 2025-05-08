import { Question } from '../entities/Question.js';
import { Passage } from '../entities/Passage.js';
import { AppDataSource } from '../config/database.js';
import { AIService } from './AIService.js';
import { Between } from 'typeorm';
import { QuestionPart, QuestionType, QuestionCategory, QuestionFilters, CreateQuestionData } from '../types/question.js';

export class QuestionService {
    private static instance: QuestionService;
    private readonly aiService: AIService;

    private constructor() {
        this.aiService = AIService.getInstance();
    }

    public static getInstance(): QuestionService {
        if (!QuestionService.instance) {
            QuestionService.instance = new QuestionService();
        }
        return QuestionService.instance;
    }

    public async createQuestion(questionData: CreateQuestionData): Promise<Question> {
        const repository = AppDataSource.getRepository(Question);
        const question = repository.create(questionData);
        return await repository.save(question);
    }

    public async generateQuestion(part: QuestionPart, type: QuestionType): Promise<Question | Question[]> {
        // Generate question using AI
        const aiContent = await this.aiService.generateTOEICQuestion(part, type);
        const questionData = JSON.parse(aiContent.content);

        if (part === 'PART5') {
            // PART 5: 1 câu hỏi đơn
            // Không truyền passage cho PART 5
            const { passage, ...rest } = questionData;
            return await this.createQuestion({
                part,
                type,
                ...rest
            });
        }

        if (part === 'PART6') {
            // PART 6: 1 passage, 4 câu hỏi
            const passageRepo = AppDataSource.getRepository(Passage);
            const passage = passageRepo.create({
                passage: questionData.passage,
                text_with_blanks: questionData.text_with_blanks,
                blank_positions: questionData.blank_positions,
                part: 'PART6'
            });
            const savedPassage = await passageRepo.save(passage);

            const questionRepo = AppDataSource.getRepository(Question);
            const questions: Question[] = [];
            for (const q of questionData.questions) {
                const question = questionRepo.create({
                    part: 'PART6',
                    type,
                    content: q.content,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    blank_index: q.blank_index,
                    passage: savedPassage
                });
                questions.push(await questionRepo.save(question));
            }
            return questions;
        }

        if (part === 'PART7') {
            // PART 7: 1 passage, nhiều câu hỏi
            const passageRepo = AppDataSource.getRepository(Passage);
            const passage = passageRepo.create({
                passage: questionData.passage,
                part: 'PART7'
            });
            const savedPassage = await passageRepo.save(passage);

            const questionRepo = AppDataSource.getRepository(Question);
            const questions: Question[] = [];
            for (const q of questionData.questions) {
                const question = questionRepo.create({
                    part: 'PART7',
                    type: q.type,
                    content: q.content,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    paragraph_number: q.paragraph_number,
                    question_category: q.question_category,
                    passage: savedPassage
                });
                questions.push(await questionRepo.save(question));
            }
            return questions;
        }

        throw new Error('Unsupported part');
    }

    public async getQuestions(filters: QuestionFilters): Promise<Question[]> {
        const repository = AppDataSource.getRepository(Question);
        const queryBuilder = repository.createQueryBuilder('question');

        if (filters.part) {
            queryBuilder.andWhere('question.part = :part', { part: filters.part });
        }

        if (filters.type) {
            queryBuilder.andWhere('question.type = :type', { type: filters.type });
        }

        if (filters.difficulty) {
            queryBuilder.andWhere('question.difficulty = :difficulty', { difficulty: filters.difficulty });
        }

        if (filters.question_category) {
            queryBuilder.andWhere('question.question_category = :category', { category: filters.question_category });
        }

        return await queryBuilder.getMany();
    }

    public async getQuestionById(id: string): Promise<Question | null> {
        const repository = AppDataSource.getRepository(Question);
        return await repository.findOneBy({ id });
    }

    public async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question | null> {
        const repository = AppDataSource.getRepository(Question);
        await repository.update(id, questionData);
        return await this.getQuestionById(id);
    }

    public async deleteQuestion(id: string): Promise<void> {
        const repository = AppDataSource.getRepository(Question);
        await repository.delete(id);
    }

    public async validateAnswer(questionId: string, userAnswer: string): Promise<boolean> {
        const question = await this.getQuestionById(questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        return question.correct_answer === userAnswer;
    }

    // New methods for PART 6 & 7
    public async getQuestionsByPassage(passageId: string): Promise<Question[]> {
        const repository = AppDataSource.getRepository(Question);
        return await repository.find({
            where: { passage: passageId },
            order: { paragraph_number: 'ASC' }
        });
    }

    public async getQuestionsByCategory(category: QuestionCategory): Promise<Question[]> {
        const repository = AppDataSource.getRepository(Question);
        return await repository.find({
            where: { question_category: category }
        });
    }

    public async getQuestionsByDifficultyRange(min: number, max: number): Promise<Question[]> {
        const repository = AppDataSource.getRepository(Question);
        return await repository.find({
            where: {
                difficulty: Between(min, max)
            }
        });
    }
} 