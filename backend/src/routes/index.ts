import { Router } from 'express';
import chatRouter from './chat.routes';

const router = Router();

router.use('/', chatRouter);

export default router;
