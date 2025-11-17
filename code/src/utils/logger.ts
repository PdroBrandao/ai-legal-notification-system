/**
 * Professional Logging Utility
 * 
 * Provides structured, color-coded logging for better terminal output readability.
 * Designed for technical demonstrations and production monitoring.
 */

export class Logger {
  private static readonly COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
  };

  /**
   * Get current timestamp in HH:MM:SS format
   */
  private static getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format log message with timestamp
   */
  private static withTimestamp(category: string, color: string, message: string): string {
    const timestamp = this.getTimestamp();
    return `${this.COLORS.gray}[${timestamp}]${this.COLORS.reset} ${color}${category}${this.COLORS.reset} ${message}`;
  }

  /**
   * Print system header
   */
  static header(title: string): void {
    const line = '━'.repeat(60);
    console.log(`\n${this.COLORS.cyan}${line}${this.COLORS.reset}`);
    console.log(`${this.COLORS.bright}${this.COLORS.cyan}  ${title}${this.COLORS.reset}`);
    console.log(`${this.COLORS.cyan}${line}${this.COLORS.reset}\n`);
  }

  /**
   * Print section divider
   */
  static divider(): void {
    console.log(`${this.COLORS.gray}${'─'.repeat(60)}${this.COLORS.reset}`);
  }

  /**
   * System-level information
   */
  static system(message: string): void {
    console.log(this.withTimestamp('[SYSTEM]', this.COLORS.cyan, message));
  }

  /**
   * Mock mode notifications
   */
  static mock(message: string): void {
    console.log(this.withTimestamp('[MOCK]', this.COLORS.magenta, `${this.COLORS.dim}${message}${this.COLORS.reset}`));
  }

  /**
   * Fetch operations
   */
  static fetch(message: string, isLoading = false): void {
    const icon = isLoading ? '⏳' : '✓';
    console.log(this.withTimestamp('[FETCH]', this.COLORS.blue, `${icon} ${message}`));
  }

  /**
   * LLM processing
   */
  static llm(message: string, isLoading = false): void {
    const icon = isLoading ? '⏳' : '✓';
    console.log(this.withTimestamp('[LLM]', this.COLORS.yellow, `${icon} ${message}`));
  }

  /**
   * Success messages
   */
  static success(message: string): void {
    console.log(this.withTimestamp('[SUCCESS]', this.COLORS.green, `✓ ${message}`));
  }

  /**
   * Info messages
   */
  static info(message: string): void {
    console.log(this.withTimestamp('[INFO]', this.COLORS.blue, message));
  }

  /**
   * Warning messages
   */
  static warn(message: string): void {
    console.log(this.withTimestamp('[WARN]', this.COLORS.yellow, `⚠ ${message}`));
  }

  /**
   * Error messages
   */
  static error(message: string, error?: any): void {
    console.log(this.withTimestamp('[ERROR]', this.COLORS.red, `✗ ${message}`));
    if (error && error.message) {
      console.log(`${this.COLORS.gray}  → ${error.message}${this.COLORS.reset}`);
    }
  }

  /**
   * Metrics summary
   */
  static metrics(label: string, value: string | number): void {
    console.log(`${this.COLORS.cyan}[METRICS]${this.COLORS.reset} ${label}: ${this.COLORS.bright}${value}${this.COLORS.reset}`);
  }

  /**
   * Output file information
   */
  static output(message: string): void {
    console.log(`${this.COLORS.green}[OUTPUT]${this.COLORS.reset} ${message}`);
  }

  /**
   * Progress indicator
   */
  static progress(current: number, total: number, item: string): void {
    const percentage = Math.round((current / total) * 100);
    console.log(`${this.COLORS.gray}[${current}/${total}]${this.COLORS.reset} ${this.COLORS.dim}${item}${this.COLORS.reset} ${this.COLORS.gray}(${percentage}%)${this.COLORS.reset}`);
  }

  /**
   * Blank line for spacing
   */
  static blank(): void {
    console.log('');
  }

  /**
   * Pipeline completion message
   */
  static complete(totalNotifications: number, validationRate: string): void {
    const message = `Pipeline completed - ${totalNotifications} notifications processed with ${validationRate} JSON validity`;
    console.log(`\n${this.COLORS.bright}${this.COLORS.green}✓ ${message}${this.COLORS.reset}\n`);
  }
}

