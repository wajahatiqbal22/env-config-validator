# Contributing to env-config-validator

Thank you for your interest in contributing to env-config-validator! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js 14.0.0 or higher
- npm, yarn, or pnpm
- Git

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/env-config-validator.git
   cd env-config-validator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Run Linting**
   ```bash
   npm run lint
   ```

## Project Structure

```
env-schema-validator/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── validator/       # Core validation logic
│   ├── cli.ts          # Command-line interface
│   ├── index.ts        # Main entry point
│   └── __tests__/      # Test files
├── dist/               # Compiled JavaScript (generated)
├── docs/               # Documentation
├── examples/           # Usage examples
└── package.json
```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write code following our coding standards
- Add tests for new functionality
- Update documentation if needed

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### 4. Build and Verify
```bash
npm run build
```

### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add new validation feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Provide proper type definitions
- Avoid `any` types when possible
- Use meaningful variable and function names

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Follow ESLint configuration

### Testing
- Write unit tests for all new functionality
- Maintain test coverage above 80%
- Use descriptive test names
- Mock external dependencies

### Documentation
- Update README.md for new features
- Add JSDoc comments for public APIs
- Include usage examples
- Update CHANGELOG.md

## Pull Request Guidelines

### Before Submitting
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

## Issue Guidelines

### Bug Reports
Include:
- Node.js version
- Package version
- Minimal reproduction case
- Expected vs actual behavior
- Error messages/stack traces

### Feature Requests
Include:
- Use case description
- Proposed API/interface
- Examples of usage
- Alternative solutions considered

## Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Publish to npm
5. Create GitHub release

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information

## Getting Help

### Resources
- [GitHub Issues](https://github.com/yourusername/env-schema-validator/issues)
- [GitHub Discussions](https://github.com/yourusername/env-schema-validator/discussions)
- [Documentation](README.md)

### Contact
- Create an issue for bugs or feature requests
- Use discussions for questions and ideas
- Email: your.email@example.com

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors graph

Thank you for contributing to env-schema-validator! 🎉
