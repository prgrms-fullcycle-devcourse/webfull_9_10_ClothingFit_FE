import 'dotenv/config';
import { defineConfig } from 'orval';

/** BE Swagger URL 확정 후 input 경로 수정 */
export default defineConfig({
  clothingFit: {
    input: {
      target: process.env.OPENAPI_URL ?? 'http://localhost:3000/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/features',
      schemas: './src/types/generated',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'apiClient',
        },
      },
    },
  },
});
