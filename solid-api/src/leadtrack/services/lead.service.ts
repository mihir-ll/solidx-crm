import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(
    id: number,
    updateDto: any,
    files: Express.Multer.File[] = [],
    isPartialUpdate = false,
    solidRequestContext: any = {},
    isUpdate = false,
  ): Promise<Lead> {
    if (updateDto.stage !== undefined && updateDto.stageId === undefined) {
      const stageId = Number(updateDto.stage);
      if (!Number.isInteger(stageId) || stageId < 1) {
        throw new BadRequestException('Pipeline stage must be a valid stage id.');
      }

      updateDto.stageId = stageId;
      delete updateDto.stage;
    }

    return super.update(
      id,
      updateDto,
      files,
      isPartialUpdate,
      solidRequestContext,
      isUpdate,
    );
  }
}
