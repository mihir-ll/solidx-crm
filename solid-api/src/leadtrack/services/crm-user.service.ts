import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { CrmUser } from '../entities/crm-user.entity';
import { CrmUserRepository } from '../repositories/crm-user.repository';

@Injectable()
export class CrmUserService extends CRUDService<CrmUser> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    repo: CrmUserRepository,
    moduleRef: ModuleRef,
  ) {
    super(entityManager, repo, 'crmUser', 'leadtrack', moduleRef);
  }
}
