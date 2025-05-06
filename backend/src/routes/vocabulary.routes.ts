import { Router } from 'express';
import { VocabularyController } from '../controllers/vocabulary.controller.js';

const router = Router();
const vocabularyController = new VocabularyController();

router.get('/', vocabularyController.getVocabulary);

export default router; 