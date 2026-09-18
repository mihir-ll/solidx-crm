import { Injectable } from '@nestjs/common';
import {
  RequestContextService,
  SecurityRuleRepository,
  SolidBaseRepository,
} from '@solidxai/core';
import { DataSource } from 'typeorm';
import { LeadTrackUser } from '../entities/leadtrack-user.entity';

@Injectable()
export class LeadTrackUserRepository extends SolidBaseRepository<LeadTrackUser> {
  constructor(
    dataSource: DataSource,
    requestContextService: RequestContextService,
    securityRuleRepository: SecurityRuleRepository,
  ) {
    super(LeadTrackUser, dataSource, requestContextService, securityRuleRepository);
  }
}
