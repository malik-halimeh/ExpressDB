import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import requestLogger from './middlewares/requestLogger.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Log HTTP requests
app.use(requestLogger);

// Mount main API router
app.use('/api', apiRouter);

// Catch unknown endpoints and throw 404
app.use(notFound);

// Centralized error mapping and formatting middleware
app.use(errorHandler);

export default app;
