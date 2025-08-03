# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of env-config-validator
- JSON Schema-based environment variable validation
- Runtime and build-time validation support
- Command-line interface with `validate`, `check`, and `init` commands
- TypeScript support with full type definitions
- Automatic type conversion (string, number, boolean, integer)
- Missing and invalid key detection
- Default value support
- Comprehensive error reporting with colored output
- CI/CD pipeline integration
- Support for custom schema and .env file paths
- Strict mode and unknown variable handling
- Silent mode for automation
- Extensive test coverage
- Complete documentation and examples

### Features
- **Schema Validation**: Define environment variables using JSON Schema
- **Type Safety**: Automatic type conversion and validation
- **CLI Tools**: Easy-to-use command-line interface
- **Flexible Configuration**: Customizable validation options
- **Developer Experience**: Beautiful error messages and warnings
- **CI/CD Ready**: Exit codes and silent mode for automation
- **Team Friendly**: Schema-driven approach for large teams

### Supported Types
- `string` with pattern, length, and enum validation
- `number` and `integer` with min/max constraints
- `boolean` with flexible true/false parsing
- Format validation (email, uri, uuid, date, etc.)

### CLI Commands
- `env-validate init` - Initialize schema file
- `env-validate validate` - Full validation with detailed output
- `env-validate check` - Quick validation check

### API
- `validateEnv()` - Simple validation function
- `EnvValidator` class - Advanced validation with custom options
- Full TypeScript definitions included

## [Unreleased]

### Planned Features
- JSON5 schema support
- Environment variable interpolation
- Custom validation functions
- Integration with popular frameworks (Express, Fastify, NestJS)
- VS Code extension for schema editing
- Web-based schema generator
- Performance optimizations
- Additional format validators
