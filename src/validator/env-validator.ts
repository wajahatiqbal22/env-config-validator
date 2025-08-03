import Ajv from 'ajv';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';
import {
  EnvSchema,
  ValidationResult,
  ValidationWarning,
  ValidatorOptions,
  ProcessedEnv,
} from '../types';
import { Logger } from '../utils/logger';

/**
 * Environment variable validator using JSON Schema
 * Supports runtime and build-time validation with comprehensive error reporting
 * 
 * @example
 * ```typescript
 * const validator = new EnvValidator({
 *   schemaPath: '.env.schema.json',
 *   exitOnError: true
 * });
 * const result = validator.validate();
 * ```
 */
export class EnvValidator {
  private readonly ajv: Ajv;
  private readonly schema: EnvSchema;
  private readonly options: Required<ValidatorOptions>;
  private readonly logger: Logger;

  constructor(options: ValidatorOptions = {}) {
    this.options = this.mergeWithDefaults(options);
    this.logger = new Logger(this.options.silent);
    this.ajv = this.initializeAjv();
    this.schema = this.loadAndValidateSchema();
  }

  /**
   * Merge user options with sensible defaults
   */
  private mergeWithDefaults(options: ValidatorOptions): Required<ValidatorOptions> {
    return {
      schemaPath: options.schemaPath ?? '.env.schema.json',
      envPath: options.envPath ?? '.env',
      strict: options.strict ?? true,
      allowUnknown: options.allowUnknown ?? false,
      exitOnError: options.exitOnError ?? true,
      silent: options.silent ?? false,
    };
  }

  /**
   * Initialize AJV with proper configuration and custom formats
   */
  private initializeAjv(): Ajv {
    const ajv = new Ajv({ 
      allErrors: true, 
      strict: false,
      removeAdditional: false,
      useDefaults: false,
      coerceTypes: false
    });
    
    this.addCustomFormats(ajv);
    return ajv;
  }

  /**
   * Add custom format validators to AJV
   */
  private addCustomFormats(ajv: Ajv): void {
    ajv.addFormat('email', {
      type: 'string',
      validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    });
    
    ajv.addFormat('uri', {
      type: 'string', 
      validate: (uri: string) => /^https?:\/\/.+/.test(uri)
    });
    
    ajv.addFormat('uuid', {
      type: 'string',
      validate: (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
    });
  }

  /**
   * Load and validate the schema file
   */
  private loadAndValidateSchema(): EnvSchema {
    const schemaPath = resolve(this.options.schemaPath);
    
    if (!existsSync(schemaPath)) {
      throw new ValidationError(`Schema file not found: ${schemaPath}`);
    }

    try {
      const schemaContent = readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent) as EnvSchema;
      
      if (!this.isValidSchema(schema)) {
        throw new ValidationError('Invalid schema format - must be a valid JSON Schema object');
      }
      
      return schema;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Failed to load schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate schema structure
   */
  private isValidSchema(schema: unknown): schema is EnvSchema {
    return (
      schema !== null &&
      typeof schema === 'object' &&
      'type' in schema &&
      schema.type === 'object' &&
      'properties' in schema &&
      schema.properties !== null &&
      typeof schema.properties === 'object'
    );
  }

  /**
   * Load environment variables from file and process.env
   */
  private loadEnvironmentVariables(): Record<string, string> {
    const envPath = resolve(this.options.envPath);
    let envFromFile: Record<string, string> = {};
    
    if (existsSync(envPath)) {
      const result = dotenvConfig({ path: envPath });
      
      if (result.error) {
        throw new ValidationError(`Failed to load .env file: ${result.error.message}`);
      }
      
      envFromFile = result.parsed || {};
    } else if (!this.options.silent) {
      this.logger.warn(`Environment file not found: ${envPath}`);
    }

    // Merge with process.env, giving precedence to process.env
    // Filter out undefined values to match Record<string, string> type
    const merged = { ...envFromFile };
    Object.entries(process.env).forEach(([key, value]) => {
      if (value !== undefined) {
        merged[key] = value;
      }
    });
    return merged;
  }

  /**
   * Convert string value to appropriate type based on schema
   */
  private processEnvValue(value: string, expectedType: string): string | number | boolean {
    switch (expectedType) {
      case 'number':
      case 'integer':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Cannot convert "${value}" to ${expectedType}`);
        }
        return expectedType === 'integer' ? Math.floor(num) : num;
      
      case 'boolean':
        const lowerValue = value.toLowerCase().trim();
        if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
          return true;
        }
        if (['false', '0', 'no', 'off', ''].includes(lowerValue)) {
          return false;
        }
        throw new Error(`Cannot convert "${value}" to boolean`);
      
      case 'string':
      default:
        return value;
    }
  }

  /**
   * Validate environment variables against schema
   */
  public validate(): ValidationResult {
    try {
      const envVars = this.loadEnvironmentVariables();
      const errors: Array<{ key: string; message: string; value?: string; expectedType?: string; }> = [];
      const warnings: ValidationWarning[] = [];
      const missingKeys: string[] = [];
      const invalidKeys: string[] = [];
      const processedEnv: ProcessedEnv = {};

      // Check required keys
      const requiredKeys = this.schema.required || [];
      for (const key of requiredKeys) {
        if (!(key in envVars) || envVars[key] === undefined || envVars[key] === '') {
          missingKeys.push(key);
          errors.push({
            key,
            message: `Required environment variable "${key}" is missing or empty`,
          });
        }
      }

      // Validate each property
      for (const [key, property] of Object.entries(this.schema.properties)) {
        const value = envVars[key];
        
        if (value === undefined || value === '') {
          if (property.default !== undefined) {
            processedEnv[key] = property.default;
            warnings.push({
              key,
              message: `Using default value for "${key}"`,
              value: String(property.default),
            });
          }
          continue;
        }

        try {
          const processedValue = this.processEnvValue(value, property.type);
          
          // Create schema for individual property validation
          const propertySchema = {
            type: property.type === 'integer' ? 'number' : property.type,
            ...(property as any),
          };

          const validate = this.ajv.compile(propertySchema);

          if (!validate(processedValue)) {
            invalidKeys.push(key);
            const errorMessage = validate.errors?.[0]?.message || 'validation failed';
            errors.push({
              key,
              message: `Invalid value for "${key}": ${errorMessage}`,
              value,
              expectedType: property.type,
            });
          } else {
            processedEnv[key] = processedValue;
          }
        } catch (error) {
          invalidKeys.push(key);
          errors.push({
            key,
            message: `Invalid value for "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            value,
            expectedType: property.type,
          });
        }
      }

      // Check for unknown keys (if not allowing unknown)
      if (!this.options.allowUnknown) {
        const schemaKeys = Object.keys(this.schema.properties);
        const systemKeys = ['npm_', 'NODE_', 'PATH', 'HOME', 'USER', 'SHELL'];
        
        for (const key of Object.keys(envVars)) {
          const isSystemKey = systemKeys.some(prefix => key.startsWith(prefix));
          if (!schemaKeys.includes(key) && !isSystemKey) {
            warnings.push({
              key,
              message: `Unknown environment variable "${key}" not defined in schema`,
              value: envVars[key],
            });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        missingKeys,
        invalidKeys,
        warnings,
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          key: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        }],
        missingKeys: [],
        invalidKeys: [],
        warnings: [],
      };
    }
  }

  /**
   * Validate environment and exit process on error (if configured)
   */
  public validateAndExit(): ProcessedEnv {
    const result = this.validate();
    
    if (!this.options.silent) {
      this.printResults(result);
    }

    if (!result.valid && this.options.exitOnError) {
      process.exit(1);
    }

    // Return processed environment variables
    const envVars = this.loadEnvironmentVariables();
    const processedEnv: ProcessedEnv = {};
    
    for (const [key, property] of Object.entries(this.schema.properties)) {
      const value = envVars[key];
      if (value !== undefined && value !== '') {
        try {
          processedEnv[key] = this.processEnvValue(value, property.type);
        } catch {
          // Error already reported in validation
        }
      } else if (property.default !== undefined) {
        processedEnv[key] = property.default;
      }
    }

    return processedEnv;
  }

  /**
   * Print validation results with colored output
   */
  private printResults(result: ValidationResult): void {
    if (result.valid) {
      this.logger.success('Environment validation passed!');
    } else {
      this.logger.error('Environment validation failed!');
    }

    if (result.errors.length > 0) {
      this.logger.section('Errors');
      this.logger.list(result.errors.map(error => error.message), 'red');
    }

    if (result.warnings.length > 0) {
      this.logger.section('Warnings');
      this.logger.list(result.warnings.map(warning => warning.message), 'yellow');
    }

    if (result.missingKeys.length > 0) {
      this.logger.error(`Missing required variables: ${result.missingKeys.join(', ')}`);
    }

    if (result.invalidKeys.length > 0) {
      this.logger.error(`Invalid variables: ${result.invalidKeys.join(', ')}`);
    }
  }
}

/**
 * Custom validation error class for environment validation
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}
