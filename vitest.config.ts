import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/actions': path.resolve(__dirname, './src/actions'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/db': path.resolve(__dirname, './src/db'),
      '@/components': path.resolve(__dirname, './src/components'),
    },
  },
});