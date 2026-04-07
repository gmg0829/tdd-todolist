# TodoList TDD

A test-driven development todo list application built with React + TypeScript + Vitest.

## Features

- Add / toggle / delete todos
- Filter by: All / Active / Completed
- Clear completed todos
- Immutable state management
- Memoized components for performance

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | React 18 |
| Language | TypeScript 5.6 |
| Bundler | Vite 5.4 |
| Test Runner | Vitest 2.0 |
| E2E Testing | Playwright |
| Coverage | @vitest/coverage-v8 |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   └── TodoList.tsx    # Main component with FilterBar + TodoItem
├── types/
│   └── todo.ts         # TypeScript interfaces (Todo, FilterType)
├── main.tsx            # React entry point
└── test/
    ├── setup.ts        # Vitest setup (jest-dom)
    └── todo.test.tsx   # Component tests
```

## Architecture

- **TDD Pattern**: Types → Tests → Implementation
- **Immutable Updates**: All state changes create new arrays/objects
- **Performance**: `memo` + `useCallback` for unnecessary re-renders
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

## API / Interface

```typescript
interface Todo {
  id: string
  content: string
  completed: boolean
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'
```
