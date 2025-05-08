import { AIGeneratedContent } from '../entities/AIGeneratedContent.js';
import { AppDataSource } from '../config/database.js';
import OpenAI from 'openai';
import { QuestionPart, QuestionType } from '../types/question.js';

export class AIService {
    private static instance: AIService;
    private readonly client: OpenAI;

    private constructor() {
        this.client = new OpenAI({
            apiKey: process.env.GROK_API_KEY,
            baseURL: process.env.GROK_API_URL || 'https://api.x.ai/v1',
        });
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    private async callGrokAPI(prompt: string): Promise<string> {
        try {
            const completion = await this.client.chat.completions.create({
                model: "grok-3-latest",
                messages: [
                    {
                        role: "system",
                        content: "You are a TOEIC test question generator. Generate high-quality questions that follow TOEIC test standards."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            return completion.choices[0].message.content || '';
        } catch (error) {
            console.error('Error calling Grok API:', error);
            throw error;
        }
    }

    private getPromptForPart(part: QuestionPart, type: QuestionType): string {
        console.log('part', part)
        switch (part) {
            case 'PART5':
                return `Generate a TOEIC ${part} question of type ${type}. 
                Format the response as JSON with the following structure:
                {
                    "content": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correct_answer": "correct option",
                    "explanation": "detailed explanation",
                    "difficulty": number between 1-5
                }`;

            case 'PART6':
                return `Generate a TOEIC PART 6 text completion passage with 4 blanks. 
                    Return the result as JSON with the following structure:
                    {
                        "passage": "full text of the passage",
                        "text_with_blanks": "text with ___ blanks",
                        "blank_positions": [position1, position2, position3, position4],
                        "questions": [
                            {
                            "blank_index": 0,
                            "content": "question text for blank 1",
                            "options": ["option1", "option2", "option3", "option4"],
                            "correct_answer": "correct option",
                            "explanation": "detailed explanation",
                            "difficulty": number between 1-5
                            },
                            {
                            "blank_index": 1,
                            "content": "question text for blank 2",
                            "options": ["option1", "option2", "option3", "option4"],
                            "correct_answer": "correct option",
                            "explanation": "detailed explanation",
                            "difficulty": number between 1-5
                            },
                            ...
                        ]
                    }`;

            case 'PART7':
                return `Generate a TOEIC ${part} reading comprehension question of type ${type}. 
                Format the response as JSON with the following structure:
                {
                    "passage": "full text of the passage",
                    "paragraph_number": number of the paragraph this question refers to,
                    "content": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correct_answer": "correct option",
                    "explanation": "detailed explanation",
                    "difficulty": number between 1-5,
                    "question_category": "${type}"
                }`;

            default:
                throw new Error(`Unsupported TOEIC part: ${part}`);
        }
    }

    public async generateTOEICQuestion(part: QuestionPart, type: QuestionType): Promise<AIGeneratedContent> {
        const prompt = this.getPromptForPart(part, type);
        const response = await this.callGrokAPI(prompt);
        const questionData = JSON.parse(response);
        console.log('questionData', questionData)
        
        const aiContent = new AIGeneratedContent();
        aiContent.type = 'question';
        aiContent.content = JSON.stringify(questionData);
        aiContent.metadata = {
            part,
            type,
            difficulty: questionData.difficulty,
            // PART 6 specific fields
            ...(part === 'PART6' && {
                blank_positions: questionData.blank_positions,
                text_with_blanks: questionData.text_with_blanks
            }),
            // PART 7 specific fields
            ...(part === 'PART7' && {
                paragraph_number: questionData.paragraph_number,
                question_category: questionData.question_category
            })
        };
        aiContent.created_by = 'system';

        const repository = AppDataSource.getRepository(AIGeneratedContent);
        return await repository.save(aiContent);
    }

    public async generateExplanation(questionId: string): Promise<AIGeneratedContent> {
        const prompt = `Generate a detailed explanation for the TOEIC question with ID ${questionId}. 
        Include grammar rules, vocabulary usage, and common mistakes.`;

        const response = await this.callGrokAPI(prompt);

        const aiContent = new AIGeneratedContent();
        aiContent.type = 'explanation';
        aiContent.content = response;
        aiContent.metadata = {
            context: `Question ID: ${questionId}`
        };
        aiContent.created_by = 'system';

        const repository = AppDataSource.getRepository(AIGeneratedContent);
        return await repository.save(aiContent);
    }

    public async analyzeUserErrors(userId: string): Promise<AIGeneratedContent> {
        const prompt = `Analyze the learning patterns and common mistakes for user ${userId}. 
        Generate personalized suggestions for improvement.`;

        const response = await this.callGrokAPI(prompt);

        const aiContent = new AIGeneratedContent();
        aiContent.type = 'suggestion';
        aiContent.content = response;
        aiContent.metadata = {
            context: `User ID: ${userId}`
        };
        aiContent.created_by = 'system';

        const repository = AppDataSource.getRepository(AIGeneratedContent);
        return await repository.save(aiContent);
    }
} 