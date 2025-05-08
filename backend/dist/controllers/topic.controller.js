import { AppDataSource } from '../config/database.js';
import { Topic } from '../entities/Topic.js';
const topicRepository = AppDataSource.getRepository(Topic);
export class TopicController {
    async getAllTopics(req, res) {
        try {
            const topics = await topicRepository.find({
                order: {
                    name: 'ASC'
                }
            });
            res.json(topics);
        }
        catch (error) {
            console.error('Error fetching topics:', error);
            res.status(500).json({ error: 'Failed to fetch topics' });
        }
    }
}
