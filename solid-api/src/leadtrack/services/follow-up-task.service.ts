import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { FollowUpTask } from '../entities/follow-up-task.entity';
import { FollowUpTaskRepository } from '../repositories/follow-up-task.repository';
import { LeadRepository } from '../repositories/lead.repository';
import { FollowUpAutomationService } from './follow-up-automation.service';

@Injectable()
export class FollowUpTaskService extends CRUDService<FollowUpTask> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    private readonly taskRepository: FollowUpTaskRepository,
    moduleRef: ModuleRef,
    private readonly leadRepository: LeadRepository,
    private readonly followUpAutomation: FollowUpAutomationService,
  ) {
    super(entityManager, taskRepository, 'followUpTask', 'leadtrack', moduleRef);
  }

  async create(dto: any, files: Express.Multer.File[] = [], ctxt: any = {}) {
    this.validateCompletionOutcome(dto?.isCompleted, dto?.outcomeNotes);
    const leadId = this.leadIdFrom(dto);
    const lead = await this.findAccessibleLead(leadId);
    await this.defaultAssignee(dto, lead);
    return super.create(dto, files, ctxt);
  }

  async insertMany(
    createDtos: any[],
    files: Express.Multer.File[][] = [],
    ctxt: any = {},
  ) {
    for (const dto of createDtos) {
      this.validateCompletionOutcome(dto?.isCompleted, dto?.outcomeNotes);
      const lead = await this.findAccessibleLead(this.leadIdFrom(dto));
      await this.defaultAssignee(dto, lead);
    }
    return super.insertMany(createDtos, files, ctxt);
  }

  async update(
    id: number,
    dto: any,
    files: Express.Multer.File[] = [],
    isPartialUpdate = false,
    ctxt: any = {},
    isUpdate = false,
  ) {
    if (dto?.leadId != null || dto?.lead != null) {
      await this.findAccessibleLead(this.leadIdFrom(dto));
    }
    const previous = await this.loadTask(id);
    const nextIsCompleted = dto?.isCompleted === undefined ? previous.isCompleted : dto.isCompleted;
    const nextOutcomeNotes = dto?.outcomeNotes === undefined ? previous.outcomeNotes : dto.outcomeNotes;
    this.validateCompletionOutcome(nextIsCompleted, nextOutcomeNotes);
    const result = await super.update(
      id,
      dto,
      files,
      isPartialUpdate,
      ctxt,
      isUpdate,
    );
    const current = await this.loadTask(id);
    if (!previous.isCompleted && current.isCompleted) {
      await this.followUpAutomation.onTaskCompleted(current);
    }
    return result;
  }

  private validateCompletionOutcome(isCompleted: unknown, outcomeNotes: unknown) {
    const completed = isCompleted === true || isCompleted === 'true';
    const hasOutcome = typeof outcomeNotes === 'string' && outcomeNotes.trim().length > 0;
    if (completed && !hasOutcome) {
      throw new BadRequestException(
        'Outcome notes are required when a follow-up task is completed.',
      );
    }
  }

  private async defaultAssignee(dto: any, lead: Lead) {
    if (
      dto.assignedToId ||
      dto.assignedTo ||
      dto.assignedToUserKey
    ) return;
    if (lead?.owner?.id) dto.assignedToId = lead.owner.id;
  }

  private leadIdFrom(dto: any) {
    const leadId = Number(dto?.leadId ?? dto?.lead?.id ?? dto?.lead);
    if (!Number.isInteger(leadId) || leadId <= 0) {
      throw new BadRequestException('A valid lead is required for a follow-up task.');
    }
    return leadId;
  }

  private async findAccessibleLead(leadId: number) {
    const query = await this.leadRepository.createSecurityRuleAwareQueryBuilder('lead');
    const lead = await query
      .leftJoinAndSelect('lead.owner', 'leadOwner')
      .andWhere('lead.id = :leadId', { leadId })
      .getOne();
    if (!lead) throw new NotFoundException('The selected lead is not available to this user.');
    return lead;
  }

  private async loadTask(id: number) {
    const query = await this.taskRepository.createSecurityRuleAwareQueryBuilder('task');
    const task = await query
      .leftJoinAndSelect('task.lead', 'lead')
      .leftJoinAndSelect('lead.owner', 'leadOwner')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .andWhere('task.id = :id', { id })
      .getOne();
    if (!task) throw new NotFoundException('The follow-up task is not available to this user.');
    return task;
  }
}
