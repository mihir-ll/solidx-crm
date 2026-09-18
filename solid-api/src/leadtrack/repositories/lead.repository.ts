import { Injectable } from '@nestjs/common';
import {
  RequestContextService,
  SecurityRuleRepository,
  SolidBaseRepository,
} from '@solidxai/core';
import { DataSource } from 'typeorm';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class LeadRepository extends SolidBaseRepository<Lead> {
  constructor(
    dataSource: DataSource,
    requestContextService: RequestContextService,
    securityRuleRepository: SecurityRuleRepository,
  ) {
    super(Lead, dataSource, requestContextService, securityRuleRepository);
  }
}
