import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmUserController } from './controllers/crm-user.controller';
import { FollowUpTaskController } from './controllers/follow-up-task.controller';
import { LeadController } from './controllers/lead.controller';
import { CrmUser } from './entities/crm-user.entity';
import { FollowUpTask } from './entities/follow-up-task.entity';
import { Lead } from './entities/lead.entity';
import { CrmUserCreationProvider } from './providers/crm-user-creation.provider';
import {
  LeadsBySourceProvider,
  LeadsCreatedTrendProvider,
  OverdueFollowUpsProvider,
  PipelineFunnelProvider,
  PipelineValueProvider,
  RepLeaderboardProvider,
} from './providers/dashboard.providers';
import { CrmUserRepository } from './repositories/crm-user.repository';
import { FollowUpTaskRepository } from './repositories/follow-up-task.repository';
import { LeadRepository } from './repositories/lead.repository';
import { FollowUpReminderJob } from './scheduled-jobs/follow-up-reminder.job';
import { CrmUserService } from './services/crm-user.service';
import { FollowUpTaskService } from './services/follow-up-task.service';
import { LeadService } from './services/lead.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrmUser, Lead, FollowUpTask])],
  controllers: [CrmUserController, LeadController, FollowUpTaskController],
  providers: [
    CrmUserRepository,
    LeadRepository,
    FollowUpTaskRepository,
    CrmUserService,
    LeadService,
    FollowUpTaskService,
    CrmUserCreationProvider,
    PipelineFunnelProvider,
    PipelineValueProvider,
    LeadsBySourceProvider,
    RepLeaderboardProvider,
    OverdueFollowUpsProvider,
    LeadsCreatedTrendProvider,
    FollowUpReminderJob,
  ],
})
export class CrmModule {}
