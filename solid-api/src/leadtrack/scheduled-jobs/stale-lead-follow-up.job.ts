import { Injectable, Logger } from '@nestjs/common';
import {
  IScheduledJob,
  ScheduledJob,
  ScheduledJobProvider,
} from '@solidxai/core';
import { FollowUpAutomationService } from '../services/follow-up-automation.service';

@Injectable()
@ScheduledJobProvider()
export class StaleLeadFollowUpJob implements IScheduledJob {
  private readonly logger = new Logger(StaleLeadFollowUpJob.name);

  constructor(private readonly followUpAutomation: FollowUpAutomationService) {}

  async execute(job: ScheduledJob): Promise<void> {
    await this.followUpAutomation.createStaleLeadNudges();
    this.logger.log(`${job.scheduleName}: processed stale leads.`);
  }
}
