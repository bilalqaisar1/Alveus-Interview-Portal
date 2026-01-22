import express from 'express';
import { getConnectionDetails } from '../controllers/livekitController.js';

const router = express.Router();

router.post('/connection-details', getConnectionDetails);

export default router;
