import { Injectable, Inject } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { TEMPORAL_CLIENT } from './temporal.factory';

@Injectable()
export class TemporalService {
  constructor(
    @Inject(TEMPORAL_CLIENT)
    private readonly client: Client,
  ) {}

  /**
   * Start a workflow execution
   * @param workflowType - The name of the workflow function
   * @param options - Workflow execution options
   * @returns Promise<string> - The workflow execution ID
   */
  async startWorkflow<T extends any[]>(
    workflowType: string,
    options: {
      taskQueue: string;
      args: T;
      workflowId: string;
      searchAttributes?: Record<string, any>;
    },
  ): Promise<string> {
    const handle = await this.client.workflow.start(workflowType, {
      taskQueue: options.taskQueue,
      args: options.args,
      workflowId: options.workflowId,
      searchAttributes: options.searchAttributes,
    });

    return handle.workflowId;
  }

  /**
   * Signal with Start - Start workflow if not exists, signal if exists
   * @param workflowType - The name of the workflow function
   * @param options - Workflow and signal options
   * @returns Promise<string> - The workflow execution ID
   */
  async signalWithStart<T extends any[]>(
    workflowType: string,
    options: {
      taskQueue: string;
      workflowId: string;
      signal: string;
      signalArgs: any[];
      args?: T;
      searchAttributes?: Record<string, any>;
    },
  ): Promise<string> {
    const handle = await this.client.workflow.signalWithStart(workflowType, {
      taskQueue: options.taskQueue,
      workflowId: options.workflowId,
      signal: options.signal,
      signalArgs: options.signalArgs,
      args: options.args || ([] as unknown as T),
      searchAttributes: options.searchAttributes,
    });

    return handle.workflowId;
  }

  /**
   * Get a workflow handle by ID
   * @param workflowId - The workflow ID
   * @returns WorkflowHandle
   */
  async getWorkflowHandle(workflowId: string) {
    return this.client.workflow.getHandle(workflowId);
  }

  /**
   * Signal a workflow
   * @param workflowId - The workflow ID
   * @param signalName - The signal name
   * @param args - Signal arguments
   */
  async signalWorkflow(workflowId: string, signalName: string, ...args: any[]) {
    const handle = await this.getWorkflowHandle(workflowId);
    await handle.signal(signalName, ...args);
  }

  /**
   * Query a workflow
   * @param workflowId - The workflow ID
   * @param queryType - The query type
   * @param args - Query arguments
   */
  async queryWorkflow(workflowId: string, queryType: string, ...args: any[]) {
    const handle = await this.getWorkflowHandle(workflowId);
    return await handle.query(queryType, ...args);
  }

  /**
   * Cancel a workflow
   * @param workflowId - The workflow ID
   */
  async cancelWorkflow(workflowId: string) {
    const handle = await this.getWorkflowHandle(workflowId);
    await handle.cancel();
  }

  /**
   * Terminate a workflow
   * @param workflowId - The workflow ID
   * @param reason - Termination reason
   */
  async terminateWorkflow(workflowId: string, reason?: string) {
    const handle = await this.getWorkflowHandle(workflowId);
    await handle.terminate(reason);
  }
}
