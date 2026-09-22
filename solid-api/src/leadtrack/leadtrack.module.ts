import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { CrmUserController } from './controllers/crm-user.controller';
import { LeadActivityReportController } from './controllers/lead-activity-report.controller';
import { LeadController } from './controllers/lead.controller';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import { CrmUser } from './entities/crm-user.entity';
import {
  LeadsBySourceProvider,
  LeadsCreatedTrendProvider,
  OverdueFollowUpsProvider,
  PipelineFunnelProvider,
  PipelineValueProvider,
  RepLeaderboardProvider,
} from './providers/dashboard.providers';
import { FollowUpTaskRepository } from './repositories/follow-up-task.repository';
import { CrmUserRepository } from './repositories/crm-user.repository';
import { LeadRepository } from './repositories/lead.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { StaleLeadFollowUpJob } from './scheduled-jobs/stale-lead-follow-up.job';
import { CrmUserCreationProvider } from './providers/crm-user-creation.provider';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { CrmUserService } from './services/crm-user.service';
import { FollowUpAutomationService } from './services/follow-up-automation.service';
import { LeadActivityReportService } from './services/lead-activity-report.service';
import { LeadService } from './services/lead.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrmUser, Lead, FollowUpTask])],
  controllers: [
    CrmUserController,
    LeadController,
    FollowUpTaskController,
    LeadActivityReportController,
  ],
  providers: [
    LeadRepository,
    CrmUserRepository,
    FollowUpTaskRepository,
    LeadService,
    FollowUpAutomationService,
    CrmUserCreationProvider,
    FollowUpTaskService,
    CrmUserService,
    LeadActivityReportService,
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
