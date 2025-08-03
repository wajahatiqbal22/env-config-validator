import chalk from 'chalk';

/**
 * Logger utility for environment validation
 */
export class Logger {
  constructor(private readonly silent: boolean = false) {}

  /**
   * Log success message with green checkmark
   */
  success(message: string): void {
    if (!this.silent) {
      console.log(chalk.green(`✓ ${message}`));
    }
  }

  /**
   * Log error message with red X
   */
  error(message: string): void {
    if (!this.silent) {
      console.error(chalk.red(`✗ ${message}`));
    }
  }

  /**
   * Log warning message with yellow triangle
   */
  warn(message: string): void {
    if (!this.silent) {
      console.warn(chalk.yellow(`⚠ ${message}`));
    }
  }

  /**
   * Log info message with blue info icon
   */
  info(message: string): void {
    if (!this.silent) {
      console.log(chalk.blue(`ℹ ${message}`));
    }
  }

  /**
   * Log debug message (only in non-silent mode)
   */
  debug(message: string): void {
    if (!this.silent) {
      console.log(chalk.gray(`🐛 ${message}`));
    }
  }

  /**
   * Log a list of items with bullet points
   */
  list(items: string[], color: 'red' | 'yellow' | 'green' | 'blue' = 'blue'): void {
    if (!this.silent && items.length > 0) {
      items.forEach(item => {
        console.log(chalk[color](`  • ${item}`));
      });
    }
  }

  /**
   * Log section header
   */
  section(title: string): void {
    if (!this.silent) {
      console.log(chalk.bold.cyan(`\n${title}:`));
    }
  }
}
