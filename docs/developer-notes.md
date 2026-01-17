# Developer Notes

## Widget entry points and aliases
- The `@widgets/*` alias points to each widget’s `src` folder.
- `import('@widgets/<name>')` resolves to `src/index.ts` by default.
- `widgetRegistry.tsx` relies on those `index.ts` files for lazy loading.
- Named exports (e.g., `AISearch`) are re-exported from each widget’s `src/index.ts`.
