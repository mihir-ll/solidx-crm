import { Injectable } from '@nestjs/common';
import {
  IWorkflowFieldDataProvider,
  IWorkflowFieldDataProviderContext,
  IWorkflowFieldDataProviderValues,
  WorkflowFieldDataProvider,
} from '@solidxai/core';
import { DataSource } from 'typeorm';
import { LeadStage } from '../entities/lead-stage.entity';

@WorkflowFieldDataProvider()
@Injectable()
export class LeadStageWorkflowFieldDataProvider
  implements IWorkflowFieldDataProvider
{
  constructor(private readonly dataSource: DataSource) {}

  name(): string {
    return 'LeadStageWorkflowFieldDataProvider';
  }

  help(): string {
    return 'Returns lead stages in their configured pipeline order.';
  }

  async values(
    _ctxt: IWorkflowFieldDataProviderContext,
  ): Promise<readonly IWorkflowFieldDataProviderValues[]> {
    const stages = await this.dataSource.getRepository(LeadStage).find({
      order: { sequence: 'ASC', id: 'ASC' },
    });

    return stages.map((stage) => ({ label: stage.name, value: stage.id }));
  }
}
