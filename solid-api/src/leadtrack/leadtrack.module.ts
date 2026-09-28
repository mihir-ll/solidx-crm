import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadActivityReportController } from './controllers/lead-activity-report.controller';
import { LeadController } from './controllers/lead.controller';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import {
  LeadOverviewKpiProvider,
  LeadsBySourceProvider,
  LeadsCreatedTrendProvider,
  OverdueFollowUpsProvider,
  PipelineFunnelProvider,
  PipelineValueProvider,
  RepLeaderboardProvider,
} from './providers/dashboard.providers';
import { FollowUpTaskRepository } from './repositories/follow-up-task.repository';
import { LeadRepository } from './repositories/lead.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { StaleLeadFollowUpJob } from './scheduled-jobs/stale-lead-follow-up.job';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { FollowUpAutomationService } from './services/follow-up-automation.service';
import { LeadActivityReportService } from './services/lead-activity-report.service';
import { LeadService } from './services/lead.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, FollowUpTask])],
  controllers: [
    LeadController,
    FollowUpTaskController,
    LeadActivityReportController,
  ],
  providers: [
    LeadRepository,
    FollowUpTaskRepository,
    LeadService,
    FollowUpAutomationService,
    FollowUpTaskService,
    LeadActivityReportService,
    LeadOverviewKpiProvider,
    PipelineFunnelProvider,
    PipelineValueProvider,
    LeadsBySourceProvider,
    RepLeaderboardProvider,
    OverdueFollowUpsProvider,
    LeadsCreatedTrendProvider,
    FollowUpReminderJob,
    StaleLeadFollowUpJob,
  ],
})
export class LeadTrackModule {}
