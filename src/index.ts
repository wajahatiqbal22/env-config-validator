export { EnvValidator } from './validator';
export * from './types';

// Convenience function for quick validation
export function validateEnv(options?: import('./types').ValidatorOptions): import('./types').ProcessedEnv {
  const { EnvValidator } = require('./validator');
  const validator = new EnvValidator(options);
  return validator.validateAndExit();
}

// Runtime validation helper
export function createEnvValidator(options?: import('./types').ValidatorOptions): import('./validator').EnvValidator {
  const { EnvValidator } = require('./validator');
  return new EnvValidator(options);
}
