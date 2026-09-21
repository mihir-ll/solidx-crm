import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadRepository } from '../repositories/lead.repository';

@Injectable()
export class LeadService extends CRUDService<Lead> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    repo: LeadRepository,
    moduleRef: ModuleRef,
  ) {
    super(entityManager, repo, 'lead', 'leadtrack', moduleRef);
  }
}
