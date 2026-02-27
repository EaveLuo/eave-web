# Frontend Coding Standards

## React

- ALWAYS use functional components with hooks
- NEVER use class components
- Prefer composition over inheritance
- Use `React.memo` for performance-critical components
- ALWAYS include proper error boundaries

## TypeScript

- NEVER use `any` type
- ALWAYS define return types for functions
- Prefer `type` over `interface` for simple objects
- Use discriminated unions for state management
- ALWAYS handle null/undefined explicitly

## Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- ALWAYS test dark mode compatibility
- Use CSS modules for component-specific styles

## Performance

- Lazy load heavy components with `React.lazy`
- Use `useCallback` and `useMemo` appropriately
- NEVER block the main thread with heavy computations
- ALWAYS optimize images and assets

## Accessibility

- ALWAYS include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast ratios
- Test with screen readers
