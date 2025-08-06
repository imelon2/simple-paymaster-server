import winston from 'winston';
import { env } from './config';

const { printf, combine, timestamp, label } = winston.format;

enum LEVELS {
  error,
  warn,
  info,
  http,
  verbose,
  debug,
  silly,
}

function kvString(meta = {}) {
  return Object.entries(meta)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
}

const MSG_WIDTH = 48;


const logFormat = printf(({ level, message, label, timestamp, ...meta }) => {
  let upperLevel = level.toUpperCase()
  if (upperLevel.length == 4) {
    upperLevel += '   ';
  }
  if (upperLevel.length == 5) {
    upperLevel += '  ';
  }

  const paramStr = kvString(meta);
  const msgPart = (message as any).length > MSG_WIDTH
    ? (message as any).slice(0, MSG_WIDTH)
    : (message as any).padEnd(MSG_WIDTH, ' ');

  return `${upperLevel}[${timestamp}] ${label}:: ${msgPart}${paramStr}`; // 날짜 [시스템이름] 로그레벨 메세지
});

export const logger = winston.createLogger({
  level: env.VERBOSITY || "debug",
  format: combine(
    timestamp({
      format: 'MM-DD|HH:mm:ss.SSS',
    }),
    label({ label: 'PM' }),
    logFormat
  ),
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }) // 색깔 넣어서 출력
    ),
  })
);
