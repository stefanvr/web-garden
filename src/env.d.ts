/// <reference types="vite/client" />

// Build-time constants substituted by vite.config.ts's `define`. Declared rather than imported
// because they are literal text replacements at build time, not module exports — there is no
// runtime module for TypeScript to resolve them from.

declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;
