import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { FollowUpTask } from '../entities/follow-up-task.entity';
import { FollowUpTaskRepository } from '../repositories/follow-up-task.repository';

@Injectable()
export class FollowUpTaskService extends CRUDService<FollowUpTask> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    repo: FollowUpTaskRepository,
    moduleRef: ModuleRef,
  ) {
    super(entityManager, repo, 'followUpTask', 'leadtrack', moduleRef);
  }
}
