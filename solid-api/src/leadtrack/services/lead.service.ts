import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadStage } from '../entities/lead-stage.entity';
import { LeadRepository } from '../repositories/lead.repository';

@Injectable()
export class LeadService extends CRUDService<Lead> {
  constructor(
    @InjectEntityManager() private readonly leadEntityManager: EntityManager,
    repo: LeadRepository,
    moduleRef: ModuleRef,
  ) {
    super(leadEntityManager, repo, 'lead', 'leadtrack', moduleRef);
  }

  async create(createDto: any, files: Express.Multer.File[] = [], ctxt: any = {}) {
    await this.normalizeStage(createDto, true);
    return super.create(createDto, files, ctxt);
  }

  async update(
    id: number,
    updateDto: any,
    files: Express.Multer.File[] = [],
    isPartialUpdate = false,
    ctxt: any = {},
    isUpdate = false,
  ) {
    await this.normalizeStage(updateDto, false);
    return super.update(
      id,
      updateDto,
      files,
      isPartialUpdate,
      ctxt,
      isUpdate,
    );
  }

  private async normalizeStage(dto: any, applyDefault: boolean) {
    if (dto.stageId == null && dto.stage != null) {
      dto.stageId = Number(
        typeof dto.stage === 'object' ? dto.stage.id : dto.stage,
      );
    }
    delete dto.stage;

    if (applyDefault && dto.stageId == null) {
      const [defaultStage] = await this.leadEntityManager
        .getRepository(LeadStage)
        .find({
          order: { sequence: 'ASC' },
          take: 1,
        });
      if (defaultStage) dto.stageId = defaultStage.id;
    }
  }
}
