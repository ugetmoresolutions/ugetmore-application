import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { LOG_DIR } from "../config/index";

// Check if running in Lambda environment
const isLambda = process.env.IS_LAMBDA === 'true';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    // Always log to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.colorize()
      ),
    }),
  ],
});

// Only configure file transports when NOT in Lambda
if (!isLambda) {
  const logDir: string = join(__dirname, LOG_DIR ?? "../logs");
  
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  logger.add(new winstonDaily({
    level: 'debug',
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + '/debug',
    filename: `%DATE%.log`,
    maxFiles: 30,
    json: false,
    zippedArchive: true,
  }));

  logger.add(new winstonDaily({
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + '/error',
    filename: `%DATE%.log`,
    maxFiles: 30,
    handleExceptions: true,
    json: false,
    zippedArchive: true,
  }));
}

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };