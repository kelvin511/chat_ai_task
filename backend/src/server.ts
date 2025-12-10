import app from './app';
import logger from './utils/logger';
import { Server } from 'socket.io';
import { socketHandler } from './socket';
import { configDotenv } from 'dotenv';
configDotenv();

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

socketHandler(io);

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
    });
});
