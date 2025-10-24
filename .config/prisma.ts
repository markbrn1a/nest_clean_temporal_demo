import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: '../src/infrastructure/prisma/schema.prisma',
  migrations: {
    path: '../src/infrastructure/prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: 'file:./dev.db',
  },
});
