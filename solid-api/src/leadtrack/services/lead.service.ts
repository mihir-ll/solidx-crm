import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@solidxai/core';
import { EntityManager } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadRepository } from '../repositories/lead.repository';
import { FollowUpAutomationService } from './follow-up-automation.service';

@Injectable()
export class LeadService extends CRUDService<Lead> {
  constructor(
    @InjectEntityManager() private readonly leadEntityManager: EntityManager,
    private readonly leadRepository: LeadRepository,
    moduleRef: ModuleRef,
    private readonly followUpAutomation: FollowUpAutomationService,
  ) {
    super(leadEntityManager, leadRepository, 'lead', 'leadtrack', moduleRef);
  }

  async create(createDto: any, files: Express.Multer.File[] = [], ctxt: any = {}) {
    this.normalizeChannelsUsed(createDto);
    this.scopeCreateToActor(createDto, ctxt);
    if (!createDto.stage) createDto.stage = 'new';
    const created = await super.create(createDto, files, ctxt);
    const lead = await this.loadLead(created.id);
    await this.followUpAutomation.onLeadCreated(lead);
    return created;
  }

  async insertMany(
    createDtos: any[],
    files: Express.Multer.File[][] = [],
    ctxt: any = {},
  ) {
    for (const dto of createDtos) {
      this.normalizeChannelsUsed(dto);
      this.scopeCreateToActor(dto, ctxt);
      if (!dto.stage) dto.stage = 'new';
    }
    const created = await super.insertMany(createDtos, files, ctxt);
    for (const item of created) {
      const lead = await this.loadLead(item.id);
      await this.followUpAutomation.onLeadCreated(lead);
    }
    return created;
  }

  async update(
    id: number,
    updateDto: any,
    files: Express.Multer.File[] = [],
    isPartialUpdate = false,
    ctxt: any = {},
    isUpdate = false,
  ) {
    this.normalizeChannelsUsed(updateDto);
    this.assertOwnerUpdateAllowed(updateDto, ctxt);
    const previous = await this.loadLead(id);
    const updated = await super.update(
      id,
      updateDto,
      files,
      isPartialUpdate,
      ctxt,
      isUpdate,
    );
    const current = await this.loadLead(id);
    await this.followUpAutomation.onLeadUpdated(previous, current);
    return updated;
  }

  private async loadLead(id: number): Promise<Lead> {
    const query = await this.leadRepository.createSecurityRuleAwareQueryBuilder('lead');
    const lead = await query
      .leftJoinAndSelect('lead.owner', 'owner')
      .andWhere('lead.id = :id', { id })
      .getOne();
    if (!lead) throw new NotFoundException('The lead is not available to this user.');
    return lead;
  }

  private scopeCreateToActor(dto: any, ctxt: any) {
    const actor = ctxt?.activeUser;
    if (!actor?.sub || actor.roles?.includes('Admin')) return;
    dto.ownerId = Number(actor.sub);
    delete dto.ownerUserKey;
  }

  private normalizeChannelsUsed(dto: any) {
    if (Array.isArray(dto?.channelsUsed)) {
      dto.channelsUsed = JSON.stringify(dto.channelsUsed);
    }
  }

  private assertOwnerUpdateAllowed(dto: any, ctxt: any) {
    const actor = ctxt?.activeUser;
    if (!actor?.sub || actor.roles?.includes('Admin')) return;

    const ownerId = dto?.ownerId ?? dto?.owner?.id;
    const ownerUserKey = dto?.ownerUserKey;
    if (
      (ownerId != null && Number(ownerId) !== Number(actor.sub)) ||
      (ownerUserKey != null && ownerUserKey !== actor.username)
    ) {
      throw new ForbiddenException('Sales representatives cannot reassign leads.');
    }
  }

}
