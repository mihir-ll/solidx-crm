import { Injectable } from '@nestjs/common';
import {
  RequestContextService,
  SecurityRuleRepository,
  SolidBaseRepository,
} from '@solidxai/core';
import { DataSource } from 'typeorm';
import { LeadStage } from '../entities/lead-stage.entity';

@Injectable()
export class LeadStageRepository extends SolidBaseRepository<LeadStage> {
  constructor(
    dataSource: DataSource,
    requestContextService: RequestContextService,
    securityRuleRepository: SecurityRuleRepository,
  ) {
    super(LeadStage, dataSource, requestContextService, securityRuleRepository);
  }
}
