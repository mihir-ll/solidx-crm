import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ChatterMessage } from '@solidxai/core';
import { EntityManager, In } from 'typeorm';
import { FollowUpTask } from '../entities/follow-up-task.entity';
import { Lead } from '../entities/lead.entity';

const TERMINAL_STAGES = new Set(['dead', 'wrong_lead_info']);
const DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class FollowUpAutomationService {
  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  async onLeadCreated(lead: Lead) {
    if (lead.stage !== 'new') return;
    await this.createIfMissing(lead, 'Make first contact call', this.afterDays(1));
  }

  async onLeadUpdated(previous: Lead, current: Lead) {
    const stageChanged = previous.stage !== current.stage;
    const ownerChanged = previous.owner?.id !== current.owner?.id;

    if (stageChanged && TERMINAL_STAGES.has(current.stage)) {
      await this.completeOpenTasks(current);
      return;
    }

    if (stageChanged) {
      const task = this.taskForStage(current);
      if (task) await this.createIfMissing(current, task.title, task.dueDate);
    }

    if (ownerChanged && current.owner) {
      await this.createIfMissing(
        current,
        'Review newly assigned lead',
        this.afterDays(1),
        current.owner,
      );
    }
  }

  async onTaskCompleted(task: FollowUpTask) {
    const lead = task.lead;
    if (!lead || TERMINAL_STAGES.has(lead.stage)) return;
    await this.createIfMissing(lead, 'Follow-up call', this.afterDays(2));
  }

  async createStaleLeadNudges() {
    const cutoff = new Date(Date.now() - 7 * DAY);
    const leads = await this.manager.getRepository(Lead).find({
      where: { stage: In(['new', 'first_contact_pending', 'follow_up', 'meeting_set', 'meeting_pending']) },
      relations: ['owner', 'tasks'],
    });
    if (!leads.length) return;
    const leadIds = leads.map((lead) => String(lead.id));
    const taskIds = leads.flatMap((lead) => lead.tasks.map((task) => String(task.id)));
    const recentAudit = await this.manager
      .getRepository(ChatterMessage)
      .createQueryBuilder('message')
      .where('message.messageType = :type', { type: 'audit' })
      .andWhere('message.coModelName IN (:...models)', {
        models: ['lead', 'followUpTask'],
      })
      .andWhere('message.createdAt >= :cutoff', { cutoff })
      .andWhere('message.coModelEntityId IN (:...ids)', {
        ids: [...leadIds, ...taskIds],
      })
      .select(['message.coModelName', 'message.coModelEntityId'])
      .getMany();
    const recentlyActiveLeadIds = new Set<number>();
    const taskLeadById = new Map(
      leads.flatMap((lead) => lead.tasks.map((task) => [String(task.id), lead.id] as const)),
    );
    for (const message of recentAudit) {
      const recordId = String(message.coModelEntityId);
      const leadId = message.coModelName === 'lead'
        ? Number(recordId)
        : taskLeadById.get(recordId);
      if (leadId) recentlyActiveLeadIds.add(leadId);
    }

    for (const lead of leads) {
      const latestTaskCompletion = lead.tasks.reduce<Date | undefined>(
        (latest, task) =>
          task.completedAt && (!latest || task.completedAt > latest)
            ? task.completedAt
            : latest,
        undefined,
      );
      const lastActivity = [lead.updatedAt, latestTaskCompletion]
        .filter((date): date is Date => date instanceof Date)
        .reduce<Date | undefined>(
          (latest, date) => (!latest || date > latest ? date : latest),
          undefined,
        );
      if (
        recentlyActiveLeadIds.has(lead.id) ||
        (lastActivity && lastActivity >= cutoff)
      ) continue;
      await this.createIfMissing(lead, 'Re-engage lead', this.afterDays(1));
    }
  }

  private taskForStage(lead: Lead): { title: string; dueDate: Date } | null {
    switch (lead.stage) {
      case 'first_contact_pending':
        return { title: 'Attempt first call', dueDate: this.afterDays(1) };
      case 'follow_up':
        return { title: 'Follow-up call', dueDate: this.afterDays(2) };
      case 'meeting_set':
        return {
          title: 'Prepare for meeting',
          dueDate: lead.meetingDate
            ? new Date(new Date(lead.meetingDate).getTime() - DAY)
            : this.afterDays(1),
        };
      case 'meeting_pending':
        return {
          title: 'Post-meeting follow-up',
          dueDate: lead.meetingDate
            ? new Date(new Date(lead.meetingDate).getTime() + DAY)
            : this.afterDays(1),
        };
      case 'opportunity_generated':
        return { title: 'Handoff notes to sales', dueDate: this.afterDays(1) };
      default:
        return null;
    }
  }

  private async createIfMissing(
    lead: Lead,
    title: string,
    dueDate: Date,
    assignedTo = lead.owner,
  ) {
    if (!lead?.id) return;
    const tasks = this.manager.getRepository(FollowUpTask);
    const existing = await tasks.findOne({
      where: { lead: { id: lead.id }, title, isCompleted: false },
    });
    if (existing) return existing;
    return tasks.save(
      tasks.create({
        lead,
        title,
        dueDate,
        assignedTo,
        channel: 'Call',
        autoCreated: true,
      }),
    );
  }

  private async completeOpenTasks(lead: Lead) {
    const tasks = await this.manager.getRepository(FollowUpTask).find({
      where: { lead: { id: lead.id }, isCompleted: false },
    });
    const completedAt = new Date();
    for (const task of tasks) {
      task.isCompleted = true;
      task.completedAt = completedAt;
    }
    if (tasks.length) await this.manager.getRepository(FollowUpTask).save(tasks);
  }

  private afterDays(days: number) {
    return new Date(Date.now() + days * DAY);
  }
}
