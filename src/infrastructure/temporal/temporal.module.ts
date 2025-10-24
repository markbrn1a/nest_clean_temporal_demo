import {
  Module,
  Global,
  Logger,
  OnApplicationShutdown,
  Inject,
} from '@nestjs/common';
import { TemporalService } from './temporal.service';
import {
  TemporalClientFactory,
  TemporalWorkerFactory,
  TEMPORAL_CLIENT,
  TEMPORAL_WORKER,
} from './temporal.factory';
import { Worker } from '@temporalio/worker';

@Global()
@Module({
  providers: [
    TemporalClientFactory,
    TemporalWorkerFactory,
    TemporalService,
    Logger,
  ],
  exports: [TEMPORAL_CLIENT, TEMPORAL_WORKER, TemporalService],
})
export class TemporalModule implements OnApplicationShutdown {
  constructor(
    @Inject(TEMPORAL_WORKER) private readonly worker: Worker,
    private readonly logger: Logger,
  ) {}

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down Temporal worker due to ${signal}`);
    try {
      await this.worker.shutdown();
      this.logger.log('Temporal worker shutdown completed');
    } catch (error) {
      this.logger.error('Error during Temporal worker shutdown:', error);
    }
  }
}
