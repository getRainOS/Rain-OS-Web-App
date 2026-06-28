import path from 'path';
import { defineConfig, loadEnv } from 'vite';

/**
 * SECURITY FIX: Removed exposed API keys from frontend bundle.
 * API_KEY and GEMINI_API_KEY are now ONLY available on the backend.
 * Frontend communicates with API via authenticated endpoints.
 */
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [],
    // REMOVED: define block that exposed secrets
    // define: {
    //   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    // }
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
