# env-schema-validator

[![npm version](https://badge.fury.io/js/env-schema-validator.svg)](https://badge.fury.io/js/env-schema-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A robust Node.js package for validating environment variables at runtime or build time using JSON schema definitions. Perfect for large teams and CI/CD pipelines.

## Features

- 🔍 **Schema-based validation** - Define your environment variables using JSON Schema
- 🚀 **Runtime & Build-time validation** - Validate during development or in CI/CD
- 🎯 **Type conversion** - Automatic conversion to proper types (string, number, boolean)
- 📋 **Missing key detection** - Auto-check for missing or invalid keys
- 🛡️ **TypeScript support** - Full TypeScript definitions included
- 🎨 **Beautiful CLI** - Colorful output with detailed error messages
- ⚙️ **Flexible configuration** - Customizable validation options
- 🔧 **CI/CD friendly** - Exit codes and silent mode for automation

## Installation

```bash
npm install env-schema-validator
# or
yarn add env-schema-validator
# or
pnpm add env-schema-validator
```

## Quick Start

### 1. Initialize Schema

Create a `.env.schema.json` file in your project root:

```bash
npx env-validate init
```

This creates an example schema file:

```json
{
  "type": "object",
  "properties": {
    "NODE_ENV": {
      "type": "string",
      "enum": ["development", "production", "test"],
      "default": "development",
      "description": "Application environment"
    },
    "PORT": {
      "type": "integer",
      "minimum": 1,
      "maximum": 65535,
      "default": 3000,
      "description": "Server port number"
    },
    "DATABASE_URL": {
      "type": "string",
      "format": "uri",
      "description": "Database connection URL"
    },
    "API_KEY": {
      "type": "string",
      "minLength": 32,
      "description": "API key for external service"
    }
  },
  "required": ["DATABASE_URL", "API_KEY"],
  "additionalProperties": false
}
```

### 2. Create Your .env File

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
API_KEY=your-super-secret-api-key-here-32chars
DEBUG=true
```

### 3. Validate

#### Command Line

```bash
# Validate environment variables
npx env-validate validate

# Quick check (minimal output)
npx env-validate check

# Custom paths
npx env-validate validate --schema ./config/env.schema.json --env ./.env.production
```

#### Programmatic Usage

```typescript
import { validateEnv, EnvValidator } from "env-schema-validator";

// Simple validation with auto-exit on error
const env = validateEnv();
console.log(env.PORT); // number: 3000
console.log(env.DEBUG); // boolean: true

// Advanced usage with custom options
const validator = new EnvValidator({
  schemaPath: "./config/env.schema.json",
  envPath: "./.env.production",
  strict: true,
  allowUnknown: false,
  exitOnError: false,
});

const result = validator.validate();
if (result.valid) {
  console.log("✅ Environment is valid!");
} else {
  console.error("❌ Validation errors:", result.errors);
}
```

## Schema Definition

### Supported Types

- **string** - Text values
- **number** - Floating point numbers
- **integer** - Whole numbers only
- **boolean** - true/false values (supports: true/false, 1/0, yes/no, on/off)

### Validation Rules

```json
{
  "type": "object",
  "properties": {
    "STRING_VAR": {
      "type": "string",
      "minLength": 5,
      "maxLength": 100,
      "pattern": "^[A-Za-z0-9_-]+$",
      "enum": ["option1", "option2", "option3"],
      "format": "email|uri|uuid|date|time|date-time",
      "default": "default-value",
      "description": "Description of this variable"
    },
    "NUMBER_VAR": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "default": 50
    },
    "INTEGER_VAR": {
      "type": "integer",
      "minimum": 1,
      "maximum": 1000,
      "default": 10
    },
    "BOOLEAN_VAR": {
      "type": "boolean",
      "default": false
    }
  },
  "required": ["STRING_VAR", "NUMBER_VAR"],
  "additionalProperties": false
}
```

## CLI Commands

### `validate`

Comprehensive validation with detailed output:

```bash
npx env-validate validate [options]

Options:
  -s, --schema <path>    Path to schema file (default: ".env.schema.json")
  -e, --env <path>       Path to .env file (default: ".env")
  --no-strict           Disable strict mode
  --allow-unknown       Allow unknown environment variables
  --no-exit             Do not exit on validation errors
  --silent              Suppress output
```

### `check`

Quick validation check (minimal output):

```bash
npx env-validate check [options]
```

### `init`

Initialize a new schema file:

```bash
npx env-validate init [options]

Options:
  -f, --force           Overwrite existing schema file
```

## API Reference

### `validateEnv(options?)`

Simple validation function that returns processed environment variables.

```typescript
import { validateEnv } from "env-schema-validator";

const env = validateEnv({
  schemaPath: ".env.schema.json",
  envPath: ".env",
  exitOnError: true,
});
```

### `EnvValidator`

Advanced validator class for custom validation logic.

```typescript
import { EnvValidator } from "env-schema-validator";

const validator = new EnvValidator(options);
const result = validator.validate();
```

#### Options

```typescript
interface ValidatorOptions {
  schemaPath?: string; // Path to schema file (default: '.env.schema.json')
  envPath?: string; // Path to .env file (default: '.env')
  strict?: boolean; // Enable strict mode (default: true)
  allowUnknown?: boolean; // Allow unknown variables (default: false)
  exitOnError?: boolean; // Exit process on error (default: true)
  silent?: boolean; // Suppress output (default: false)
}
```

#### Validation Result

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  missingKeys: string[];
  invalidKeys: string[];
  warnings: ValidationWarning[];
}
```

## Integration Examples

### Express.js Application

```typescript
// app.ts
import express from "express";
import { validateEnv } from "env-schema-validator";

// Validate environment at startup
const env = validateEnv();

const app = express();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "env-validate check && nodemon src/app.ts",
    "build": "env-validate validate && tsc",
    "start": "env-validate check --silent && node dist/app.js",
    "test": "env-validate validate --env .env.test && jest"
  }
}
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Validate environment before starting
RUN npx env-validate check --silent
CMD ["npm", "start"]
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm ci
      - run: npx env-validate validate --env .env.example
      - run: npm test
```

## Error Handling

The validator provides detailed error messages:

```bash
✗ Environment validation failed!

Errors:
  • Required environment variable "DATABASE_URL" is missing or empty
  • Invalid value for "PORT": must be >= 1
  • Invalid value for "NODE_ENV": must be equal to one of the allowed values

Warnings:
  • Using default value for "DEBUG"
  • Unknown environment variable "LEGACY_VAR" not defined in schema

Missing required variables: DATABASE_URL
Invalid variables: PORT, NODE_ENV
```

## Best Practices

### 1. Schema Organization

```json
{
  "type": "object",
  "properties": {
    // Group related variables
    "NODE_ENV": {
      "type": "string",
      "enum": ["development", "production", "test"]
    },

    // Database configuration
    "DATABASE_URL": { "type": "string", "format": "uri" },
    "DATABASE_POOL_SIZE": { "type": "integer", "minimum": 1, "default": 10 },

    // API configuration
    "API_KEY": { "type": "string", "minLength": 32 },
    "API_RATE_LIMIT": { "type": "integer", "minimum": 1, "default": 1000 }
  },
  "required": ["DATABASE_URL", "API_KEY"]
}
```

### 2. Environment-Specific Schemas

```bash
# Development
npx env-validate validate --schema .env.schema.json --env .env

# Production
npx env-validate validate --schema .env.schema.prod.json --env .env.production

# Testing
npx env-validate validate --schema .env.schema.test.json --env .env.test
```

### 3. Team Workflows

```json
{
  "scripts": {
    "postinstall": "env-validate check --silent || echo 'Please check your .env file'",
    "precommit": "env-validate validate",
    "predeploy": "env-validate validate --env .env.production"
  }
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/wajahatiqbal22/env-schema-validator.git
cd env-schema-validator
npm install
npm run build
npm test
```

## License

MIT © [Your Name](https://github.com/yourusername)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Support

- 📖 [Documentation](https://github.com/wajahatiqbal22/env-schema-validator#readme)
- 🐛 [Issue Tracker](https://github.com/wajahatiqbal22/env-schema-validator/issues)
- 💬 [Discussions](https://github.com/wajahatiqbal22/env-schema-validator/discussions)
