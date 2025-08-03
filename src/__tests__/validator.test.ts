import { EnvValidator } from '../validator';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and dotenv
jest.mock('fs');
jest.mock('dotenv');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockDotenv = require('dotenv');

describe('EnvValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env
    delete process.env.TEST_VAR;
    delete process.env.NODE_ENV;
    delete process.env.PORT;
  });

  const mockSchema = {
    type: 'object' as const,
    properties: {
      NODE_ENV: {
        type: 'string' as const,
        enum: ['development', 'production', 'test'],
        default: 'development',
      },
      PORT: {
        type: 'integer' as const,
        minimum: 1,
        maximum: 65535,
        default: 3000,
      },
      DEBUG: {
        type: 'boolean' as const,
        default: false,
      },
      API_KEY: {
        type: 'string' as const,
        minLength: 10,
      },
    },
    required: ['API_KEY'],
  };

  describe('constructor', () => {
    it('should load schema successfully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));

      const validator = new EnvValidator();
      expect(validator).toBeInstanceOf(EnvValidator);
    });

    it('should throw error if schema file not found', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => new EnvValidator()).toThrow('Schema file not found');
    });

    it('should throw error for invalid schema', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: 'schema' }));

      expect(() => new EnvValidator()).toThrow('Invalid schema format');
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      mockDotenv.config.mockReturnValue({ parsed: {} });
    });

    it('should pass validation with valid environment', () => {
      process.env.API_KEY = 'valid-api-key-123';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missingKeys).toHaveLength(0);
    });

    it('should fail validation with missing required key', () => {
      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.missingKeys).toContain('API_KEY');
      expect(result.errors[0].key).toBe('API_KEY');
    });

    it('should handle type conversion correctly', () => {
      process.env.API_KEY = 'valid-api-key-123';
      process.env.PORT = '8080';
      process.env.DEBUG = 'true';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should fail validation with invalid type', () => {
      process.env.API_KEY = 'valid-api-key-123';
      process.env.PORT = 'not-a-number';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(false);
      expect(result.invalidKeys).toContain('PORT');
    });

    it('should handle boolean conversion', () => {
      process.env.API_KEY = 'valid-api-key-123';
      process.env.DEBUG = 'false';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should use default values', () => {
      process.env.API_KEY = 'valid-api-key-123';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate enum values', () => {
      process.env.API_KEY = 'valid-api-key-123';
      process.env.NODE_ENV = 'invalid-env';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(false);
      expect(result.invalidKeys).toContain('NODE_ENV');
    });

    it('should validate string length', () => {
      process.env.API_KEY = 'short';

      const validator = new EnvValidator();
      const result = validator.validate();

      expect(result.valid).toBe(false);
      expect(result.invalidKeys).toContain('API_KEY');
    });
  });

  describe('validateAndExit', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      mockDotenv.config.mockReturnValue({ parsed: {} });
      
      // Mock process.exit
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      // Mock console methods
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should exit on validation failure when exitOnError is true', () => {
      const validator = new EnvValidator({ exitOnError: true });
      
      expect(() => validator.validateAndExit()).toThrow('process.exit called');
    });

    it('should not exit on validation failure when exitOnError is false', () => {
      process.env.API_KEY = 'valid-api-key-123';
      
      const validator = new EnvValidator({ exitOnError: false });
      const result = validator.validateAndExit();
      
      expect(result).toBeDefined();
    });
  });
});
