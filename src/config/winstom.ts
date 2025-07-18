import winston from 'winston';

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

const logDir = `${process.cwd()}/logs`;

const logFormat = printf(({ level, message, label, timestamp }) => {
  let upperLevel = level.toUpperCase();
  if (upperLevel.length == 4) {
    upperLevel += '   ';
  }
  if (upperLevel.length == 5) {
    upperLevel += '  ';
  }
  return `${upperLevel}[${timestamp}] ${label}:: ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
});

export const logger = winston.createLogger({
  level: 'debug',
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
