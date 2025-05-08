import { AppDataSource } from '../config/database.js';
import { Vocabulary } from '../entities/Vocabulary.js';
const vocabularyRepository = AppDataSource.getRepository(Vocabulary);
export class VocabularyController {
    async getVocabulary(req, res) {
        const topicId = req.query.topicId;
        try {
            const queryBuilder = vocabularyRepository
                .createQueryBuilder('vocabulary')
                .leftJoinAndSelect('vocabulary.topic', 'topic')
                .select([
                'vocabulary.id',
                'vocabulary.word',
                'vocabulary.pronunciation',
                'vocabulary.meaning',
                'vocabulary.topic_id',
                'vocabulary.synonym',
                'vocabulary.word_family',
                'vocabulary.example',
                'topic.name'
            ])
                .orderBy('vocabulary.word');
            if (topicId) {
                queryBuilder.where('vocabulary.topic_id = :topicId', { topicId });
            }
            const vocabulary = await queryBuilder.getMany();
            // Transform the result to match the expected format
            const formattedVocabulary = vocabulary.map(item => ({
                ...item,
                topic_name: item.topic?.name
            }));
            res.json(formattedVocabulary);
        }
        catch (error) {
            console.error('Error fetching vocabulary:', error);
            res.status(500).json({ error: 'Failed to fetch vocabulary' });
        }
    }
}
