import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { LeadTrackUser } from '../entities/leadtrack-user.entity';
import { LeadTrackUserRepository } from '../repositories/leadtrack-user.repository';

@Injectable()
export class LeadTrackUserService extends CRUDService<LeadTrackUser> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    repo: LeadTrackUserRepository,
    moduleRef: ModuleRef,
  ) {
    super(entityManager, repo, 'leadTrackUser', 'leadtrack', moduleRef);
  }
}
