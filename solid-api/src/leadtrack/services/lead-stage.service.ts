import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { LeadStage } from '../entities/lead-stage.entity';
import { LeadStageRepository } from '../repositories/lead-stage.repository';

@Injectable()
export class LeadStageService extends CRUDService<LeadStage> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    repo: LeadStageRepository,
    moduleRef: ModuleRef,
  ) {
    super(entityManager, repo, 'leadStage', 'leadtrack', moduleRef);
  }
}
