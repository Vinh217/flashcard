import { Router } from 'express';
import { TopicController } from '../controllers/topic.controller.js';
const router = Router();
const topicController = new TopicController();
router.get('/', topicController.getAllTopics);
export default router;
