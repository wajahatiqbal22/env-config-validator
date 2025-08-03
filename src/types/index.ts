export interface EnvSchema {
  type: 'object';
  properties: Record<string, EnvProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface EnvProperty {
  type: 'string' | 'number' | 'boolean' | 'integer';
  description?: string;
  default?: string | number | boolean;
  enum?: (string | number | boolean)[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  format?: 'email' | 'uri' | 'uuid' | 'date' | 'time' | 'date-time';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  missingKeys: string[];
  invalidKeys: string[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  key: string;
  message: string;
  value?: string;
  expectedType?: string;
}

export interface ValidationWarning {
  key: string;
  message: string;
  value?: string;
}

export interface ValidatorOptions {
  schemaPath?: string;
  envPath?: string;
  strict?: boolean;
  allowUnknown?: boolean;
  exitOnError?: boolean;
  silent?: boolean;
}

export interface ProcessedEnv {
  [key: string]: string | number | boolean;
}
