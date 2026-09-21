import { BadRequestException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { LeadStage } from '../entities/lead-stage.entity';
import { LeadStageRepository } from '../repositories/lead-stage.repository';

const FIRST_STAGE_CODE = 'new';

@Injectable()
export class LeadStageService extends CRUDService<LeadStage> {
  constructor(
    @InjectEntityManager() private readonly stageEntityManager: EntityManager,
    repo: LeadStageRepository,
    moduleRef: ModuleRef,
  ) {
    super(stageEntityManager, repo, 'leadStage', 'leadtrack', moduleRef);
  }

  async create(createDto: any, files: Express.Multer.File[] = [], ctxt: any = {}) {
    createDto.code = await this.createUniqueCode(createDto.name);
    createDto.sequence = await this.nextSequence(createDto.afterStageId);
    const stage = await super.create(createDto, files, ctxt);
    await this.reorder(stage.id, createDto.afterStageId);
    return stage;
  }

  async update(
    id: number,
    updateDto: any,
    files: Express.Multer.File[] = [],
    isPartialUpdate = false,
    ctxt: any = {},
    isUpdate = false,
  ) {
    if (updateDto.afterStageId === id) {
      throw new BadRequestException('A stage cannot be placed after itself.');
    }
    const shouldReorder = updateDto.afterStageId !== undefined;
    if (shouldReorder) {
      const current = await this.stageEntityManager
        .getRepository(LeadStage)
        .findOneBy({ id });
      if (current?.code === FIRST_STAGE_CODE) {
        throw new BadRequestException('The New stage must remain first.');
      }
    }
    const stage = await super.update(
      id,
      updateDto,
      files,
      true,
      ctxt,
      isUpdate,
    );
    if (shouldReorder) await this.reorder(id, updateDto.afterStageId);
    return stage;
  }

  async delete(id: number, ctxt: any = {}) {
    const stage = await this.stageEntityManager
      .getRepository(LeadStage)
      .findOneBy({ id });
    if (stage?.code === FIRST_STAGE_CODE) {
      throw new BadRequestException('The New stage cannot be deleted.');
    }
    const result = await super.delete(id, ctxt);
    await this.rebuildLinks();
    return result;
  }

  private async createUniqueCode(name: string) {
    const base =
      String(name ?? '')
        .trim()
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('') || 'Stage';
    const repo = this.stageEntityManager.getRepository(LeadStage);
    let code = base;
    let suffix = 2;
    while (await repo.exists({ where: { code } })) code = `${base}${suffix++}`;
    return code;
  }

  private async nextSequence(afterStageId?: number) {
    const repo = this.stageEntityManager.getRepository(LeadStage);
    if (afterStageId != null) {
      const stage = await repo.findOneBy({ id: afterStageId });
      if (!stage) throw new BadRequestException('The selected preceding stage was not found.');
      return stage.sequence + 1;
    }
    const last = await repo.findOne({ order: { sequence: 'DESC', id: 'DESC' } });
    return (last?.sequence ?? 0) + 10;
  }

  private async reorder(stageId: number, afterStageId?: number) {
    const repo = this.stageEntityManager.getRepository(LeadStage);
    const stages = await repo.find({ order: { sequence: 'ASC', id: 'ASC' } });
    const moved = stages.find((stage) => stage.id === stageId);
    if (!moved) return;
    if (moved.code === FIRST_STAGE_CODE && afterStageId != null) {
      throw new BadRequestException('The New stage must remain first.');
    }

    const firstStage = stages.find((stage) => stage.code === FIRST_STAGE_CODE);
    const ordered = stages.filter(
      (stage) => stage.id !== stageId && stage.id !== firstStage?.id,
    );
    if (firstStage && firstStage.id !== moved.id) ordered.unshift(firstStage);
    if (afterStageId == null) {
      if (moved.code === FIRST_STAGE_CODE) ordered.unshift(moved);
      else ordered.push(moved);
    } else {
      const index = ordered.findIndex((stage) => stage.id === afterStageId);
      if (index < 0) throw new BadRequestException('The selected preceding stage was not found.');
      ordered.splice(index + 1, 0, moved);
    }

    await this.stageEntityManager.transaction(async (trx) => {
      for (let index = 0; index < ordered.length; index++) {
        await trx.getRepository(LeadStage).update(ordered[index].id, {
          sequence: (index + 1) * 10,
          afterStage: index === 0 ? null : ordered[index - 1],
        });
      }
    });
  }

  private async rebuildLinks() {
    const repo = this.stageEntityManager.getRepository(LeadStage);
    const stages = await repo.find({ order: { sequence: 'ASC', id: 'ASC' } });
    stages.sort((left, right) => {
      if (left.code === FIRST_STAGE_CODE) return -1;
      if (right.code === FIRST_STAGE_CODE) return 1;
      return left.sequence - right.sequence || left.id - right.id;
    });
    for (let index = 0; index < stages.length; index++) {
      await repo.update(stages[index].id, {
        sequence: (index + 1) * 10,
        afterStage: index === 0 ? null : stages[index - 1],
      });
    }
  }
}
