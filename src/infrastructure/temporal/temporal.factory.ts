import { FactoryProvider, Logger } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import { join } from 'path';
import * as userActivities from '../../contexts/user/infrastructure/temporal/activities/user-activities';
import * as paymentActivities from '../../contexts/payment/infrastructure/temporal/activities/payment-activities';
import * as customerActivities from '../../contexts/customer/infrastructure/temporal/activities/customer-activities';

export const TEMPORAL_CLIENT = 'TEMPORAL_CLIENT';
export const TEMPORAL_WORKER = 'TEMPORAL_WORKER';

export const TemporalClientFactory: FactoryProvider<Client> = {
  provide: TEMPORAL_CLIENT,
  useFactory: async () => {
    const temporalHost = process.env.TEMPORAL_HOST || 'localhost:7233';
    const temporalNamespace = process.env.TEMPORAL_NAMESPACE || 'default';

    const connection = await Connection.connect({ address: temporalHost });
    return new Client({
      namespace: temporalNamespace,
      connection,
    });
  },
  inject: [],
};

export const TemporalWorkerFactory: FactoryProvider<Worker> = {
  provide: TEMPORAL_WORKER,
  useFactory: async (logger: Logger) => {
    const worker = await Worker.create({
      workflowsPath: join(__dirname, 'workflows'),
      activities: {
        ...userActivities,
        ...paymentActivities,
        ...customerActivities,
      },
      taskQueue: 'main-task-queue',
    });

    // Start the worker but keep the promise to handle shutdown
    const runPromise = worker.run();

    // Handle worker errors
    runPromise.catch((err) => {
      logger.error('Temporal Worker error:', err);
    });

    // Store the run promise on the worker for potential access
    (worker as any).runPromise = runPromise;

    logger.log('Temporal Worker created and started');
    return worker;
  },
  inject: [Logger],
};
