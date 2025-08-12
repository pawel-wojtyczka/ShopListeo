/**
 * Prosty logger aplikacji z różnymi poziomami logowania
 * W późniejszym etapie można go rozszerzyć o bardziej zaawansowane funkcje
 * (np. integrację z zewnętrznymi systemami logowania)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

/**
 * Logger aplikacji
 */
export const logger = {
  /**
   * Loguje wiadomość z poziomem debug
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  },

  /**
   * Loguje wiadomość z poziomem info
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  },

  /**
   * Loguje wiadomość z poziomem warn
   */
  warn(message: string, context?: Record<string, unknown>, error?: Error | unknown): void {
    this.log("warn", message, context, error);
  },

  /**
   * Loguje wiadomość z poziomem error
   */
  error(message: string, context?: Record<string, unknown>, error?: Error | unknown): void {
    this.log("error", message, context, error);
  },

  /**
   * Główna funkcja logująca
   */
  log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error | unknown): void {
    const timestamp = new Date().toISOString();
    const _entry: LogEntry = { level, message, timestamp, context, error };

    // Formatowanie wiadomości z timestampem i poziomem
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Dodanie kontekstu jeśli istnieje
    const contextStr = context ? ` | Context: ${JSON.stringify(context, null, 2)}` : '';
    
    // Dodanie błędu jeśli istnieje
    const errorStr = error ? ` | Error: ${error instanceof Error ? error.message : String(error)}` : '';

    // W zależności od poziomu logowania używamy odpowiedniej metody konsoli
    switch (level) {
      case "debug":
        console.debug(formattedMessage + contextStr + errorStr);
        break;
      case "info":
        console.info(formattedMessage + contextStr + errorStr);
        break;
      case "warn":
        console.warn(formattedMessage + contextStr + errorStr);
        break;
      case "error":
        console.error(formattedMessage + contextStr + errorStr);
        // Dodatkowo wyświetlamy stack trace dla błędów
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack);
        }
        break;
    }

    // Tutaj w przyszłości można dodać kod zapisujący logi do zewnętrznego systemu
  },
};
