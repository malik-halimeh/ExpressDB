import morgan from 'morgan';

/**
 * Morgan logger middleware configuration
 * Formats: HTTP Method, URL path, Status code, Response time (ms)
 */
export const requestLogger = morgan(':method :url :status :response-time ms');

export default requestLogger;
