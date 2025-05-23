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

    // W zależności od poziomu logowania używamy odpowiedniej metody konsoli
    switch (level) {
      case "debug":
        break;
      case "info":
        break;
      case "warn":
        break;
      case "error":
        break;
    }

    // Tutaj w przyszłości można dodać kod zapisujący logi do zewnętrznego systemu
  },
};
