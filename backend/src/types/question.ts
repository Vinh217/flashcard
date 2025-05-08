export type QuestionPart = 'PART5' | 'PART6' | 'PART7';

export type QuestionType = 
    | 'grammar' 
    | 'vocabulary' 
    | 'preposition' 
    | 'conjunction' 
    | 'main_idea' 
    | 'detail' 
    | 'inference' 
    | 'purpose' 
    | 'reference';

export type QuestionCategory = 'main_idea' | 'detail' | 'inference' | 'purpose' | 'reference';

export interface QuestionFilters {
    part?: QuestionPart;
    type?: QuestionType;
    difficulty?: number;
    question_category?: QuestionCategory;
}

export interface CreateQuestionData {
    part: QuestionPart;
    type: QuestionType;
    content: string;
    passage?: string;
    text_with_blanks?: string;
    blank_positions?: number[];
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: number;
    paragraph_number?: number;
    question_category?: QuestionCategory;
} 