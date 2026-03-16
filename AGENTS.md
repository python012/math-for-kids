# AGENTS.md - Development Guidelines for Math-for-Kids

## Project Overview
- **Project name**: math-for-kids
- **Type**: Next.js 16 web application (React 19)
- **Purpose**: Educational math game for children learning multiplication (1-10)
- **Platform**: Vercel deployment ready

## Build Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Build
npm run build            # Production build
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint

# Type checking
npx tsc --noEmit         # TypeScript type check only
```

## Code Style Guidelines

### General Principles
- Use TypeScript for all new code (strict mode enabled)
- Prefer functional components with hooks
- Keep components small and focused
- Avoid unnecessary comments (unless explaining complex logic)
- All files must pass ESLint and TypeScript type check before commit

### Imports
- React hooks: `import { useState, useCallback, useRef, useEffect } from "react";`
- Next.js: `import { useRouter } from "next/navigation";`
- Order: React → external libraries → internal components/utilities

### Naming Conventions
- Components: PascalCase (e.g., `GameCard`, `GridCell`)
- Functions/variables: camelCase (e.g., `handleSubmit`, `selectedCells`)
- Interfaces/Types: PascalCase with descriptive names (e.g., `SelectedCells`)
- Boolean variables: prefix with `is`, `has`, `should` (e.g., `isDragging`, `hasError`)

### TypeScript
- Always define prop types for components
- Use explicit return types for complex functions
- Avoid `any` type - use `unknown` if type is truly unknown
- Strict mode is enabled in tsconfig.json

### Error Handling
- Use try-catch for async operations
- Handle hydration issues in Next.js (use `useEffect` for client-only state)
- Provide user-friendly error messages
- Handle global events in useEffect with proper cleanup

### React/Next.js Specific

#### Hydration Prevention (IMPORTANT)
For components using random data, Math.random(), or browser APIs:
```typescript
// Option 1: Use useEffect to set initial state
const [question, setQuestion] = useState({ num1: 1, num2: 1, answer: 1 });
useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setQuestion(generateQuestion());
}, []);

// Option 2: Use dynamic import with SSR disabled
import dynamic from 'next/dynamic';
const ClientComponent = dynamic(() => import('./ClientComponent'), { ssr: false });

// Option 3: Use 'force-dynamic' for the page
export const dynamic = 'force-dynamic';
```

#### Event Handlers
- Use `useCallback` for event handlers passed to child components
- Define event handler types explicitly (e.g., `React.MouseEvent`, `React.TouchEvent`)
- Use refs for values needed in event handlers to avoid stale closures in useEffect

#### ESLint Rules
- Avoid calling setState directly in useEffect (use eslint-disable comment if needed):
  ```typescript
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(generateQuestion());
  }, []);
  ```
- Hooks must be called in the exact same order in every component render

### CSS/Tailwind
- Use Tailwind CSS utility classes
- Prefer responsive classes: `md:w-10`, `lg:text-2xl`
- Use semantic class names for complex custom styles
- Keep custom CSS in `globals.css` or use `<style jsx>` for component-specific styles

### File Organization
```
src/
├── app/
│   ├── page.tsx         # Main game page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/          # Reusable components (if any)
└── lib/                 # Utility functions (if any)
```

## Vercel Deployment
- Project is configured for Vercel deployment
- No special configuration needed - just push to git and import in Vercel
- Build command: `npm run build`
- Output directory: `.next`

## Working with This Codebase

### Running Locally
```bash
npm run dev
# Open http://localhost:3000
```

### Making Changes
1. Run `npm run lint` before committing
2. Test changes in browser
3. Verify no TypeScript errors: `npx tsc --noEmit`

### Common Issues
- **Hydration mismatch**: Ensure random data or browser APIs are only used client-side
- **Missing dependencies**: Run `npm install` after pulling changes
- **Cache issues**: Delete `.next` folder if experiencing strange errors

## Game Logic Reference

### Current Implementation
- 10x10 grid of selectable cells
- User selects rows and columns by clicking/dragging
- Submit button checks if selected area equals multiplication answer
- Score tracking with sound effects on correct answers

### State Structure
```typescript
interface SelectedCells {
  rows: number[];  // Selected row indices (0-9)
  cols: number[];  // Selected column indices (0-9)
}

interface Question {
  num1: number;    // 1-10
  num2: number;    // 1-10
  answer: number;  // num1 * num2
}
```