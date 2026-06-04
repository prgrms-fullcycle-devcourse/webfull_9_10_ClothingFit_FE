import 'dotenv/config';
import { defineConfig } from 'orval';

/**
 * 백엔드 OpenAPI 스펙으로부터 react-query 훅 + 타입을 생성한다.
 * 생성물은 src/api/generated 아래에만 위치하며(수작업 코드와 분리), 직접 수정하지 않는다.
 * 재생성: `npm run generate:api`
 */
export default defineConfig({
  clothingFit: {
    input: {
      target: process.env.OPENAPI_URL ?? 'https://clothing-fit-be.onrender.com/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/endpoints',
      schemas: './src/api/generated/schemas',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'apiClient',
        },
      },
    },
  },
});
