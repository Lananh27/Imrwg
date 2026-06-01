import { Router } from 'express';
import { createAttention, getAllAttention, updateAttention, deleteAttention } from '../controllers/attention.controller';

const router = Router();

// Routes for managing Attention items
router.post('/attention', createAttention);  // Create
router.get('/attention', getAllAttention);   // Get all Attention
router.put('/attention/:id', updateAttention);  // Update
router.delete('/attention/:id', deleteAttention);  // Delete

export default router;