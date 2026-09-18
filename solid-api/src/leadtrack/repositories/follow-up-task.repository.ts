import { Injectable } from '@nestjs/common';
import {
  RequestContextService,
  SecurityRuleRepository,
  SolidBaseRepository,
} from '@solidxai/core';
import { DataSource } from 'typeorm';
import { FollowUpTask } from '../entities/follow-up-task.entity';

@Injectable()
export class FollowUpTaskRepository extends SolidBaseRepository<FollowUpTask> {
  constructor(
    dataSource: DataSource,
    requestContextService: RequestContextService,
    securityRuleRepository: SecurityRuleRepository,
  ) {
    super(
      FollowUpTask,
      dataSource,
      requestContextService,
      securityRuleRepository,
    );
  }
}
