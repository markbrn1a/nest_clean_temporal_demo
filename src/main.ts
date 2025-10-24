import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TEMPORAL_WORKER } from './infrastructure/temporal/temporal.factory';
import { Worker } from '@temporalio/worker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the Temporal worker for graceful shutdown
  const worker = app.get<Worker>(TEMPORAL_WORKER);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await worker.shutdown();
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await worker.shutdown();
    await app.close();
    process.exit(0);
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
