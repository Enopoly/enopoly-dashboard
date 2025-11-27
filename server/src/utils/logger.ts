export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLog(level: LogLevel, message: string, ...args: unknown[]): string {
  const timestamp = formatTimestamp();
  const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : "";
  return `[${timestamp}] [${level}] ${message}${argsStr}`;
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    console.debug(formatLog(LogLevel.DEBUG, message, ...args));
  },

  info: (message: string, ...args: unknown[]) => {
    console.info(formatLog(LogLevel.INFO, message, ...args));
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(formatLog(LogLevel.WARN, message, ...args));
  },

  error: (message: string, ...args: unknown[]) => {
    console.error(formatLog(LogLevel.ERROR, message, ...args));
  },
};

