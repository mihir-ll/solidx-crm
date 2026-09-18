import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  IScheduledJob,
  MailFactory,
  ScheduledJob,
  ScheduledJobProvider,
} from '@solidxai/core';
import { EntityManager, LessThanOrEqual } from 'typeorm';
import { FollowUpTask } from '../entities/follow-up-task.entity';

@Injectable()
@ScheduledJobProvider()
export class FollowUpReminderJob implements IScheduledJob {
  private readonly logger = new Logger(FollowUpReminderJob.name);
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly mailFactory: MailFactory,
  ) {}

  async execute(job: ScheduledJob): Promise<void> {
    const reminderWindow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tasks = await this.entityManager.find(FollowUpTask, {
      where: { isCompleted: false, dueDate: LessThanOrEqual(reminderWindow) },
      relations: ['lead', 'assignedTo', 'lead.owner'],
    });
    const mail = this.mailFactory.getMailService();
    for (const task of tasks) {
      const recipient = task.assignedTo?.email ?? task.lead?.owner?.email;
      if (!recipient) continue;
      await mail.sendEmailUsingTemplate(
        recipient,
        'leadtrack-follow-up-reminder',
        { task, lead: task.lead, dueDate: task.dueDate.toISOString() },
        true,
        [],
        [],
        'followUpTask',
        task.id,
      );
    }
    this.logger.log(
      `${job.scheduleName}: queued ${tasks.length} follow-up reminder(s).`,
    );
  }
}
