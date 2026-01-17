# Developer Notes

## Widget entry points and aliases
- The `@widgets/*` alias points to each widget’s `src` folder.
- `import('@widgets/<name>')` resolves to `src/index.ts` by default.
- `widgetRegistry.tsx` relies on those `index.ts` files for lazy loading.
- Named exports (e.g., `AISearch`) are re-exported from each widget’s `src/index.ts`.

## Callback handlers in JSX
- `onClick={doThing}` passes a function reference.
- `onClick={() => doThing(arg)}` defers execution until the event, and captures `arg`.
- Avoid `onClick={doThing()}` unless you want it to run during render.

## useMemo in App.tsx
- `useMemo` caches derived values between renders.
- Example: `alertedProductIds` is memoized so the `Set` only rebuilds when `alerts` change.

## useContext for theme
- `useContext(ColorModeContext)` provides app-wide theme mode and toggle.
- This avoids prop-drilling and keeps theme switching seamless across the shell.
