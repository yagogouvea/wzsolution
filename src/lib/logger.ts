/**
 * Sistema de logging para produção
 * Garante que todos os logs sejam visíveis no Railway
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context);
    console.log(formatted);
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    };
    const formatted = this.formatMessage('error', message, errorContext);
    console.error(formatted);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      const formatted = this.formatMessage('debug', message, context);
      console.log(formatted);
    }
  }

  // Método específico para APIs
  api(route: string, method: string, statusCode: number, duration?: number, context?: LogContext): void {
    const apiContext = {
      route,
      method,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      ...context
    };
    const formatted = this.formatMessage('info', `API ${method} ${route} - ${statusCode}`, apiContext);
    console.log(formatted);
  }
}

export const logger = new Logger();

