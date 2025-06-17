# Contributing to expo-game-center

Thank you for your interest in contributing to expo-game-center! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 16 or higher
- Expo CLI (`npm install -g expo-cli`)
- iOS development environment (Xcode, iOS Simulator)
- CocoaPods (for iOS dependencies)

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/expo-game-center.git
   cd expo-game-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the module**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Run linting**
   ```bash
   npm run lint
   ```

## Project Structure

```
expo-game-center/
├── src/                    # TypeScript source code
│   ├── index.ts           # Main module exports
│   ├── ExpoGameCenterModule.ts  # Module implementation
│   └── types.ts           # TypeScript type definitions
├── ios/                   # Native iOS implementation
│   ├── ExpoGameCenterModule.swift  # Swift implementation
│   ├── ExpoGameCenterBridge.m/h    # Objective-C bridge
│   └── ExpoGameCenter.podspec      # CocoaPods spec
├── plugin/                # Expo config plugin
│   └── src/index.ts      # Plugin implementation
├── example/               # Example application
├── docs/                  # Additional documentation
└── __tests__/            # Test files
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run build
   npm run test
   npm run lint
   ```

4. **Test with the example app**
   ```bash
   cd example
   npm install
   expo start
   ```

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is handled by Prettier
- **Naming**: Use camelCase for variables and functions, PascalCase for classes and types

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add achievement progress tracking
fix: resolve authentication timeout issue
docs: update README with new API methods
```

## Testing

### Unit Tests

Write unit tests for all new functionality:

```bash
npm test
```

Tests should be placed in `__tests__/` directories or as `.test.ts` files alongside source code.

### Manual Testing

Test your changes on:
- Physical iOS device with Game Center enabled
- iOS Simulator (with mock implementation)
- Example app integration

### Test Checklist

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] ESLint passes

## Native Development

### iOS Development

When modifying native iOS code:

1. **Swift Code** (`ExpoGameCenterModule.swift`)
   - Follow Swift naming conventions
   - Use proper error handling with promises
   - Add documentation comments

2. **Objective-C Bridge** (`ExpoGameCenterBridge.m/h`)
   - Maintain compatibility with React Native bridge
   - Use proper memory management

3. **CocoaPods** (`ExpoGameCenter.podspec`)
   - Update version numbers appropriately
   - Ensure dependencies are correct

### Testing Native Changes

1. **Build the example app**
   ```bash
   cd example
   expo run:ios
   ```

2. **Test on device**
   - Physical iOS device recommended
   - Test all Game Center functionality
   - Verify error handling

## Documentation

### API Documentation

- Update README.md for new features
- Add JSDoc comments to public methods
- Include code examples for new functionality

### Internal Documentation

- Comment complex logic
- Document native bridge methods
- Update architecture diagrams if needed

## Pull Request Process

1. **Before submitting**
   - [ ] All tests pass
   - [ ] Documentation updated
   - [ ] Code follows style guidelines
   - [ ] Commit messages follow convention

2. **Pull Request Description**
   - Describe what changes were made
   - Explain why the changes were necessary
   - Link to any related issues
   - Include screenshots/videos if relevant

3. **Review Process**
   - Address reviewer feedback
   - Update tests if requested
   - Ensure CI/CD passes

## Release Process

Releases are handled by maintainers:

1. **Version Bump**
   - Update version in `package.json`
   - Update version in `ExpoGameCenter.podspec`
   - Create changelog entry

2. **Testing**
   - Full test suite
   - Manual testing on device
   - Example app verification

3. **Release**
   - Create GitHub release
   - Publish to npm
   - Update documentation

## Issues and Bugs

### Reporting Issues

When reporting issues, please include:

- **Environment**: Expo SDK version, iOS version, device type
- **Steps to reproduce**: Detailed reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Code samples**: Relevant code snippets
- **Logs**: Error messages and stack traces

### Bug Fixes

- Reference the issue number in your commit
- Add regression tests to prevent future issues
- Consider backward compatibility

## Community Guidelines

- Be respectful and constructive
- Help others learn and contribute
- Follow the code of conduct
- Ask questions if you're unsure

## Getting Help

- **Documentation**: Check README and inline docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join the Expo Discord for community help

Thank you for contributing to expo-game-center! 🎮