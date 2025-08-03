#!/usr/bin/env node

import { Command } from 'commander';
import { EnvValidator } from './validator';
import { ValidatorOptions } from './types';
import { writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';

const program = new Command();

program
  .name('env-validate')
  .description('Validate environment variables against a JSON schema')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate environment variables')
  .option('-s, --schema <path>', 'Path to schema file', '.env.schema.json')
  .option('-e, --env <path>', 'Path to .env file', '.env')
  .option('--no-strict', 'Disable strict mode')
  .option('--allow-unknown', 'Allow unknown environment variables')
  .option('--no-exit', 'Do not exit on validation errors')
  .option('--silent', 'Suppress output')
  .action((options) => {
    try {
      const validatorOptions: ValidatorOptions = {
        schemaPath: options.schema,
        envPath: options.env,
        strict: options.strict,
        allowUnknown: options.allowUnknown,
        exitOnError: options.exit,
        silent: options.silent,
      };

      const validator = new EnvValidator(validatorOptions);
      validator.validateAndExit();
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a new .env.schema.json file')
  .option('-f, --force', 'Overwrite existing schema file')
  .action((options) => {
    const schemaPath = '.env.schema.json';
    
    if (existsSync(schemaPath) && !options.force) {
      console.error('Schema file already exists. Use --force to overwrite.');
      process.exit(1);
    }

    const exampleSchema = {
      type: 'object',
      properties: {
        NODE_ENV: {
          type: 'string',
          enum: ['development', 'production', 'test'],
          default: 'development',
          description: 'Application environment'
        },
        PORT: {
          type: 'integer',
          minimum: 1,
          maximum: 65535,
          default: 3000,
          description: 'Server port number'
        },
        DATABASE_URL: {
          type: 'string',
          format: 'uri',
          description: 'Database connection URL'
        },
        API_KEY: {
          type: 'string',
          minLength: 32,
          description: 'API key for external service'
        },
        DEBUG: {
          type: 'boolean',
          default: false,
          description: 'Enable debug mode'
        },
        MAX_CONNECTIONS: {
          type: 'integer',
          minimum: 1,
          default: 100,
          description: 'Maximum number of database connections'
        }
      },
      required: ['DATABASE_URL', 'API_KEY'],
      additionalProperties: false
    };

    writeFileSync(schemaPath, JSON.stringify(exampleSchema, null, 2));
    console.log(chalk.green(`✓ Created ${schemaPath} with example schema`));
  });

program
  .command('check')
  .description('Quick validation check (alias for validate)')
  .option('-s, --schema <path>', 'Path to schema file', '.env.schema.json')
  .option('-e, --env <path>', 'Path to .env file', '.env')
  .action((options) => {
    try {
      const validator = new EnvValidator({
        schemaPath: options.schema,
        envPath: options.env,
        exitOnError: true,
      });
      
      const result = validator.validate();
      
      if (result.valid) {
        console.log(chalk.green('✓ Environment validation passed'));
        process.exit(0);
      } else {
        console.log(chalk.red('✗ Environment validation failed'));
        result.errors.forEach(error => {
          console.log(chalk.red(`  • ${error.message}`));
        });
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// Default command
if (process.argv.length === 2) {
  program.help();
}

program.parse();
