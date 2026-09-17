import { Injectable } from '@nestjs/common';
import {
  RequestContextService,
  SecurityRuleRepository,
  SolidBaseRepository,
} from '@solidxai/core';
import { DataSource } from 'typeorm';
import { CrmUser } from '../entities/crm-user.entity';

@Injectable()
export class CrmUserRepository extends SolidBaseRepository<CrmUser> {
  constructor(
    dataSource: DataSource,
    requestContextService: RequestContextService,
    securityRuleRepository: SecurityRuleRepository,
  ) {
    super(CrmUser, dataSource, requestContextService, securityRuleRepository);
  }
}
